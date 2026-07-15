import { ChecklistCategory, PregnancyStage } from '../store/usePregnancyStore';

export const CATEGORY_META: Record<ChecklistCategory, { emoji: string; label: string }> = {
  checkup: { emoji: '🩺', label: '產檢' },
  bag: { emoji: '📦', label: '待產包' },
  shopping: { emoji: '🛒', label: '用品採購' },
  postpartum: { emoji: '🏠', label: '坐月子' },
  finance: { emoji: '💰', label: '財務' },
  naming: { emoji: '📝', label: '命名登記' },
  subsidy: { emoji: '🎁', label: '補助' },
  childcare: { emoji: '🏫', label: '公幼申請' },
};

export const STAGE_META: Record<PregnancyStage, { label: string; shortLabel: string }> = {
  early: { label: '孕早期', shortLabel: '早期' },
  mid: { label: '孕中期', shortLabel: '中期' },
  late: { label: '孕晚期', shortLabel: '晚期' },
  postpartum_stage: { label: '產後', shortLabel: '產後' },
};

export const STAGE_ORDER: PregnancyStage[] = ['early', 'mid', 'late', 'postpartum_stage'];

export const BAG_ITEM_EMOJI: Record<string, string> = {
  b1: '🪪',
  b2: '👕',
  b3: '🩹',
  b4: '🤱',
  b5: '👶',
  b6: '🧣',
  b7: '🧻',
  b8: '🔌',
};
