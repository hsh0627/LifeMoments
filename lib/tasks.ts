import { ParentRole, ChecklistItem } from '../store/usePregnancyStore';
import { getItemStatus, ItemStatus } from './checklistStatus';

export interface TodayQuest {
  id: string;
  emoji: string;
  title: string;
  xp: number;
  optional?: boolean; // 額外任務，可交給另一半
  status?: ItemStatus;
}

const STATUS_PRIORITY: Record<Exclude<ItemStatus, null>, number> = {
  overdue: 0,
  soon: 1,
  future: 2,
};

function pickCheckupQuests(checklist: ChecklistItem[], currentWeek: number, limit: number) {
  return checklist
    .filter((i) => i.category === 'checkup' && !i.done)
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
  const checkupPicks = pickCheckupQuests(checklist, currentWeek, 2);
  const bagRemaining = checklist.some((i) => i.category === 'bag' && !i.done);

  const quests: TodayQuest[] = checkupPicks.map(({ item, status }) => ({
    id: item.id,
    emoji: '📅',
    title: role === 'dad' ? `提醒／陪同：${item.title}` : item.title,
    xp: item.xp,
    status,
  }));

  if (bagRemaining) {
    quests.push({
      id: 'bag',
      emoji: '📦',
      title: role === 'dad' ? '準備待產包' : '更新待產包清單',
      xp: role === 'dad' ? 20 : 15,
      optional: role !== 'dad',
    });
  }

  return quests;
}
