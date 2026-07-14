import { ChecklistItem } from '../store/usePregnancyStore';

export type ItemStatus = 'overdue' | 'soon' | 'future' | null;

export function getItemStatus(item: ChecklistItem, currentWeek: number): ItemStatus {
  if (item.done || item.week === undefined) return null;
  if (currentWeek > item.week) return 'overdue';
  if (currentWeek >= item.week - 2) return 'soon';
  return 'future';
}

export const STATUS_STYLE: Record<Exclude<ItemStatus, null>, { label: string; bg: string; color: string }> = {
  overdue: { label: '已過期', bg: '#F5D0CC', color: '#C0392B' },
  soon: { label: '即將到來', bg: '#FFE8B3', color: '#B7791F' },
  future: { label: '未來', bg: '#E5DFD3', color: '#9C8570' },
};
