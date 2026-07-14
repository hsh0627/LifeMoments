import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PregnancyProfile {
  id: string;
  lmpDate: string;   // Last Menstrual Period (末次月經)
  dueDate: string;
  babyName?: string;
}

export type ParentRole = 'mom' | 'dad';
export type Storyline = 'pregnancy';

export type ChecklistCategory = 'checkup' | 'bag';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  done: boolean;
  xp: number;
  week?: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', category: 'checkup', title: '初診（確認懷孕）', done: false, xp: 30, week: 6 },
  { id: 'c2', category: 'checkup', title: '8-12週 第一孕期超音波', done: false, xp: 20, week: 8 },
  { id: 'c3', category: 'checkup', title: '11-13週 唐氏症篩檢', done: false, xp: 20, week: 11 },
  { id: 'c4', category: 'checkup', title: '20週 大排畸超音波', done: false, xp: 25, week: 20 },
  { id: 'c5', category: 'checkup', title: '24-28週 妊娠糖尿病篩查', done: false, xp: 20, week: 24 },
  { id: 'c6', category: 'checkup', title: '35-37週 乙型鏈球菌篩查', done: false, xp: 20, week: 35 },
  { id: 'b1', category: 'bag', title: '孕婦手冊、健保卡、身分證', done: false, xp: 10 },
  { id: 'b2', category: 'bag', title: '換洗衣物（3套）', done: false, xp: 10 },
  { id: 'b3', category: 'bag', title: '產褥墊', done: false, xp: 5 },
  { id: 'b4', category: 'bag', title: '母乳墊', done: false, xp: 5 },
  { id: 'b5', category: 'bag', title: '寶寶衣物（新生兒 2-3套）', done: false, xp: 10 },
  { id: 'b6', category: 'bag', title: '包巾 2條', done: false, xp: 5 },
  { id: 'b7', category: 'bag', title: '濕紙巾', done: false, xp: 5 },
  { id: 'b8', category: 'bag', title: '充電器', done: false, xp: 5 },
];

interface PregnancyState {
  storyline: Storyline | null;
  role: ParentRole | null;
  profile: PregnancyProfile | null;
  currentWeek: number;
  xp: number;
  level: number;
  badges: string[];
  justLeveledUp: boolean;
  checklist: ChecklistItem[];
  setStoryline: (storyline: Storyline) => void;
  setRole: (role: ParentRole) => void;
  setProfile: (profile: PregnancyProfile) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badge: string) => void;
  clearLevelUpFlag: () => void;
  completeChecklistItem: (id: string) => void;
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

export const usePregnancyStore = create<PregnancyState>()(
  persist(
    (set, get) => ({
      storyline: null,
      role: null,
      profile: null,
      currentWeek: 0,
      xp: 0,
      level: 1,
      badges: [],
      justLeveledUp: false,
      checklist: DEFAULT_CHECKLIST,
      setStoryline: (storyline) => set({ storyline }),
      setRole: (role) => set({ role }),
      setProfile: (profile) =>
        set({ profile, currentWeek: calculateWeek(profile.lmpDate) }),
      addXP: (amount) => {
        const { xp, level } = get();
        const newXP = xp + amount;
        const newLevel = calculateLevel(newXP);
        set({ xp: newXP, level: newLevel, justLeveledUp: newLevel > level });
      },
      unlockBadge: (badge) => {
        const { badges } = get();
        if (!badges.includes(badge)) {
          set({ badges: [...badges, badge] });
        }
      },
      clearLevelUpFlag: () => set({ justLeveledUp: false }),
      completeChecklistItem: (id) => {
        const { checklist, badges } = get();
        const item = checklist.find((i) => i.id === id);
        if (!item || item.done) return;
        const nextChecklist = checklist.map((i) => (i.id === id ? { ...i, done: true } : i));
        set({ checklist: nextChecklist });
        get().addXP(item.xp);
        const category = item.category;
        const categoryItems = nextChecklist.filter((i) => i.category === category);
        if (categoryItems.every((i) => i.done) && !badges.includes('checklist_pro')) {
          get().unlockBadge('checklist_pro');
        }
      },
    }),
    {
      name: 'lifemoments-pregnancy-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { justLeveledUp, ...persisted } = state;
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          state.currentWeek = calculateWeek(state.profile.lmpDate);
        }
      },
    }
  )
);
