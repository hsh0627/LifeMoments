import { ParentRole, ChecklistItem, ChecklistCategory, PregnancyStage } from '../store/usePregnancyStore';
import { getItemStatus, ItemStatus } from './checklistStatus';
import { CATEGORY_META } from './checklistMeta';

export interface TodayQuest {
  id: string;
  emoji: string;
  title: string;
  xp: number;
  optional?: boolean; // 額外任務，可交給另一半
  status?: ItemStatus;
  category: ChecklistCategory;
  stage: PregnancyStage;
}

const STATUS_PRIORITY: Record<Exclude<ItemStatus, null>, number> = {
  overdue: 0,
  soon: 1,
  future: 2,
};

/** 挑出有明確週數、依「已過期→即將到來→未來」排序的前幾筆待辦（跨所有類別，不只產檢） */
function pickUrgentQuests(checklist: ChecklistItem[], currentWeek: number, limit: number) {
  return checklist
    .filter((i) => i.week !== undefined && !i.done)
    .map((i) => ({ item: i, status: getItemStatus(i, currentWeek) }))
    .sort((a, b) => {
      const pa = a.status ? STATUS_PRIORITY[a.status] : 3;
      const pb = b.status ? STATUS_PRIORITY[b.status] : 3;
      if (pa !== pb) return pa - pb;
      return (a.item.week ?? 99) - (b.item.week ?? 99);
    })
    .slice(0, limit);
}

export function getTodayQuests(
  role: ParentRole | null,
  checklist: ChecklistItem[],
  currentWeek: number
): TodayQuest[] {
  const urgentPicks = pickUrgentQuests(checklist, currentWeek, 2);
  const bagRemaining = checklist.some((i) => i.category === 'bag' && !i.done);

  const quests: TodayQuest[] = urgentPicks.map(({ item, status }) => ({
    id: item.id,
    emoji: CATEGORY_META[item.category].emoji,
    title: role === 'dad' && item.category === 'checkup' ? `提醒／陪同：${item.title}` : item.title,
    xp: item.xp,
    status,
    category: item.category,
    stage: item.stage,
  }));

  if (bagRemaining) {
    const bagItem = checklist.find((i) => i.category === 'bag');
    quests.push({
      id: 'bag',
      emoji: CATEGORY_META.bag.emoji,
      title: role === 'dad' ? '準備待產包' : '更新待產包清單',
      xp: role === 'dad' ? 20 : 15,
      optional: role !== 'dad',
      category: 'bag',
      stage: bagItem?.stage ?? 'late',
    });
  }

  return quests;
}
