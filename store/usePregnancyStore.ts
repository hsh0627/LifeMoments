import { create } from 'zustand';

interface PregnancyProfile {
  id: string;
  lmpDate: string;   // Last Menstrual Period (末次月經)
  dueDate: string;
  babyName?: string;
}

interface PregnancyState {
  profile: PregnancyProfile | null;
  currentWeek: number;
  xp: number;
  level: number;
  badges: string[];
  setProfile: (profile: PregnancyProfile) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badge: string) => void;
}

function calculateWeek(lmpDate: string): number {
  const lmp = new Date(lmpDate);
  const today = new Date();
  const diffMs = today.getTime() - lmp.getTime();
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, Math.min(diffWeeks, 42));
}

function calculateLevel(xp: number): number {
  // 每 100 XP 升一級
  return Math.floor(xp / 100) + 1;
}

export const usePregnancyStore = create<PregnancyState>((set, get) => ({
  profile: null,
  currentWeek: 0,
  xp: 0,
  level: 1,
  badges: [],
  setProfile: (profile) =>
    set({ profile, currentWeek: calculateWeek(profile.lmpDate) }),
  addXP: (amount) => {
    const newXP = get().xp + amount;
    set({ xp: newXP, level: calculateLevel(newXP) });
  },
  unlockBadge: (badge) => {
    const { badges } = get();
    if (!badges.includes(badge)) {
      set({ badges: [...badges, badge] });
    }
  },
}));
