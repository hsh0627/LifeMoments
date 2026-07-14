import { supabase } from './supabase';
import { usePregnancyStore, ParentRole, ChecklistItem } from '../store/usePregnancyStore';

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let subscribed = false;

/**
 * App 啟動、登入完成、或選好 storyline 後呼叫一次。
 * 找不到雲端 instance 就用目前本機資料（以 activeInstanceId 當作雲端 id）建一個新的；
 * 找得到就用雲端資料覆蓋本機。
 */
export async function bootstrapCloudSync(userId: string) {
  const { storyline, role, activeInstanceId, cloudInstanceId } = usePregnancyStore.getState();
  if (!storyline || !activeInstanceId) return;

  try {
    if (!cloudInstanceId) {
      const { data: membership } = await supabase
        .from('lifemoment_members')
        .select('instance_id, role, lifemoment_instances!inner(lifemoment_type)')
        .eq('user_id', userId)
        .eq('lifemoment_instances.lifemoment_type', storyline)
        .maybeSingle();

      if (membership) {
        await loadFromCloud(userId, membership.instance_id);
      } else {
        await createCloudInstance(userId, activeInstanceId, storyline, role);
      }
    } else {
      await loadFromCloud(userId, cloudInstanceId);
    }
  } catch (e) {
    console.log('[cloudSync] bootstrap failed, staying on local data:', e);
  }

  startAutoSync(userId);
}

async function createCloudInstance(userId: string, instanceId: string, storyline: string, role: ParentRole | null) {
  const { error: instanceError } = await supabase
    .from('lifemoment_instances')
    .insert({ id: instanceId, lifemoment_type: storyline, created_by: userId });
  if (instanceError) {
    console.log('[cloudSync] failed to create instance:', instanceError);
    return;
  }

  const { error: memberError } = await supabase
    .from('lifemoment_members')
    .insert({ instance_id: instanceId, user_id: userId, role });
  if (memberError) {
    console.log('[cloudSync] failed to create membership:', memberError);
    return;
  }

  usePregnancyStore.setState({ cloudInstanceId: instanceId });
  await pushToCloud(userId);
}

async function loadFromCloud(userId: string, instanceId: string) {
  const [{ data: profileRow }, { data: checklistRows }, { data: progressRow }] = await Promise.all([
    supabase.from('pregnancy_profiles').select('*').eq('instance_id', instanceId).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('instance_id', instanceId),
    supabase.from('user_progress').select('*').eq('instance_id', instanceId).eq('user_id', userId).maybeSingle(),
  ]);

  const state = usePregnancyStore.getState();
  const updates: Partial<ReturnType<typeof usePregnancyStore.getState>> = { cloudInstanceId: instanceId };

  if (profileRow) {
    updates.profile = { id: instanceId, lmpDate: profileRow.lmp_date, dueDate: profileRow.due_date };
  }

  if (checklistRows && checklistRows.length > 0) {
    const doneMap = new Map(checklistRows.map((r) => [r.item_id, r.done]));
    updates.checklist = state.checklist.map((item: ChecklistItem) =>
      doneMap.has(item.id) ? { ...item, done: doneMap.get(item.id)! } : item
    );
  }

  if (progressRow) {
    updates.xp = progressRow.xp;
    updates.level = progressRow.level;
    updates.badges = progressRow.badges ?? [];
    updates.streak = progressRow.streak;
    updates.freezeCards = progressRow.freeze_cards;
    updates.lastCheckInDate = progressRow.last_check_in_date;
    updates.lastFreezeGrantWeek = progressRow.last_freeze_grant_week;
  }

  usePregnancyStore.setState(updates);
}

/** 把目前的本機狀態整包 upsert 上雲端。 */
export async function pushToCloud(userId: string) {
  const state = usePregnancyStore.getState();
  const instanceId = state.cloudInstanceId;
  if (!instanceId) return;

  const tasks: PromiseLike<unknown>[] = [];

  if (state.profile) {
    tasks.push(
      supabase.from('pregnancy_profiles').upsert({
        instance_id: instanceId,
        lmp_date: state.profile.lmpDate,
        due_date: state.profile.dueDate,
        updated_at: new Date().toISOString(),
      })
    );
  }

  const doneItems = state.checklist.filter((i) => i.done);
  if (doneItems.length > 0) {
    tasks.push(
      supabase.from('checklist_items').upsert(
        doneItems.map((i) => ({
          instance_id: instanceId,
          item_id: i.id,
          done: true,
          done_by: userId,
          done_at: new Date().toISOString(),
        }))
      )
    );
  }

  tasks.push(
    supabase.from('user_progress').upsert({
      user_id: userId,
      instance_id: instanceId,
      xp: state.xp,
      level: state.level,
      badges: state.badges,
      streak: state.streak,
      freeze_cards: state.freezeCards,
      last_check_in_date: state.lastCheckInDate,
      last_freeze_grant_week: state.lastFreezeGrantWeek,
      updated_at: new Date().toISOString(),
    })
  );

  try {
    await Promise.all(tasks);
  } catch (e) {
    console.log('[cloudSync] push failed:', e);
  }
}

/** 訂閱本機 store 變化，debounce 後自動推上雲端。只需要呼叫一次。 */
function startAutoSync(userId: string) {
  if (subscribed) return;
  subscribed = true;
  usePregnancyStore.subscribe(() => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      pushToCloud(userId);
    }, 1500);
  });
}
