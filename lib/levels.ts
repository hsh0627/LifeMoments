import { ParentRole } from '../store/usePregnancyStore';

export interface LevelTier {
  minLevel: number;
  title: string;
  themeColor: string;
}

const THEME_COLORS = ['#C4885A', '#7C5C3E', '#5A7A4A', '#4A6FA5', '#9B59B6'];

const MOM_TITLES = ['新手媽媽', '見習冒險者', '熟練媽媽', '資深玩家', '傳說媽媽'];
const DAD_TITLES = ['新手奶爸', '見習隊友', '熟練奶爸', '資深神隊友', '傳說奶爸'];

const MIN_LEVELS = [1, 3, 5, 8, 12];

function buildTiers(titles: string[]): LevelTier[] {
  return MIN_LEVELS.map((minLevel, i) => ({
    minLevel,
    title: titles[i],
    themeColor: THEME_COLORS[i],
  }));
}

export const MOM_LEVEL_TIERS = buildTiers(MOM_TITLES);
export const DAD_LEVEL_TIERS = buildTiers(DAD_TITLES);

export function getLevelTier(level: number, role?: ParentRole | null): LevelTier {
  const tiers = role === 'dad' ? DAD_LEVEL_TIERS : MOM_LEVEL_TIERS;
  let tier = tiers[0];
  for (const t of tiers) {
    if (level >= t.minLevel) tier = t;
  }
  return tier;
}

export const AI_ASSISTANT_UNLOCK_LEVEL = 3;
