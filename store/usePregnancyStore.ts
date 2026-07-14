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

/** 一條「已經開始過」的人生大事線的完整快照，用來在切換時暫存 */
export interface LifeMomentInstance {
  id: string;
  storyline: Storyline;
  role: ParentRole | null;
  cloudInstanceId: string | null;
  profile: PregnancyProfile | null;
  currentWeek: number;
  xp: number;
  level: number;
  badges: string[];
  checklist: ChecklistItem[];
  lastCheckInDate: string | null;
  streak: number;
  freezeCards: number;
  lastFreezeGrantWeek: string | null;
}

interface PregnancyState {
  // 背包：目前沒有在看、但之前已經開始過的人生大事線
  instances: LifeMomentInstance[];
  activeInstanceId: string | null;

  // 目前使用中那一條線的資料（跟舊版欄位保持一致，畫面元件不用大改）
  storyline: Storyline | null;
  role: ParentRole | null;
  cloudInstanceId: string | null;
  profile: PregnancyProfile | null;
  currentWeek: number;
  xp: number;
  level: number;
  badges: string[];
  justLeveledUp: boolean;
  checklist: ChecklistItem[];
  lastCheckInDate: string | null;
  streak: number;
  freezeCards: number;
  lastFreezeGrantWeek: string | null;

  setStoryline: (storyline: Storyline) => void;
  setRole: (role: ParentRole) => void;
  setProfile: (profile: PregnancyProfile) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badge: string) => void;
  clearLevelUpFlag: () => void;
  completeChecklistItem: (id: string) => void;
  checkIn: () => { xpEarned: number; usedFreeze: boolean; streakReset: boolean; streak: number } | null;

  /** 開始一條全新的人生大事線；目前這條（如果有的話）會先存進背包，不會刪掉 */
  startNewLifeMoment: (storyline: Storyline) => void;
  /** 切回背包裡某一條線；目前這條會先存進背包 */
  switchToInstance: (id: string) => void;
  /** 把目前這條線收進背包，回到「選人生大事」畫面（角色選擇畫面用的返回也是這個） */
  archiveActiveAndGoToPicker: () => void;
  /** 選人生大事線但還沒選角色就按返回：因為這條線根本還沒真的開始，直接丟棄，不進背包 */
  cancelOnboarding: () => void;
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

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function getWeekId(date: Date): string {
  // ISO 週次識別碼，例如 "2026-W29"，用來判斷「這週有沒有發過補簽卡」
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const weekNum = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

const MAX_FREEZE_CARDS = 3;

function checkInXP(streak: number): number {
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  return 5;
}

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function blankActiveFields() {
  return {
    activeInstanceId: null as string | null,
    storyline: null as Storyline | null,
    role: null as ParentRole | null,
    cloudInstanceId: null as string | null,
    profile: null as PregnancyProfile | null,
    currentWeek: 0,
    xp: 0,
    level: 1,
    badges: [] as string[],
    checklist: DEFAULT_CHECKLIST,
    lastCheckInDate: null as string | null,
    streak: 0,
    freezeCards: 0,
    lastFreezeGrantWeek: null as string | null,
  };
}

export const usePregnancyStore = create<PregnancyState>()(
  persist(
    (set, get) => ({
      instances: [],
      ...blankActiveFields(),
      justLeveledUp: false,

      setStoryline: (storyline) => {
        set({ storyline, activeInstanceId: uuidv4() });
      },
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
      checkIn: () => {
        const { lastCheckInDate, streak, freezeCards, lastFreezeGrantWeek } = get();
        const now = new Date();
        const today = formatDate(now);
        if (lastCheckInDate === today) return null; // 今天已簽到

        // 每週自動補發 1 張補簽卡（上限 MAX_FREEZE_CARDS）
        const weekId = getWeekId(now);
        let nextFreezeCards = freezeCards;
        let nextFreezeGrantWeek = lastFreezeGrantWeek;
        if (lastFreezeGrantWeek !== weekId) {
          nextFreezeCards = Math.min(nextFreezeCards + 1, MAX_FREEZE_CARDS);
          nextFreezeGrantWeek = weekId;
        }

        let nextStreak: number;
        let usedFreeze = false;
        let streakReset = false;

        if (!lastCheckInDate) {
          nextStreak = 1;
        } else {
          const gap = daysBetween(lastCheckInDate, today);
          if (gap === 1) {
            nextStreak = streak + 1;
          } else {
            const missedDays = gap - 1;
            if (missedDays > 0 && nextFreezeCards >= missedDays) {
              nextFreezeCards -= missedDays;
              nextStreak = streak + 1;
              usedFreeze = true;
            } else {
              nextStreak = 1;
              streakReset = true;
            }
          }
        }

        const xpEarned = checkInXP(nextStreak);
        set({
          lastCheckInDate: today,
          streak: nextStreak,
          freezeCards: nextFreezeCards,
          lastFreezeGrantWeek: nextFreezeGrantWeek,
        });
        get().addXP(xpEarned);
        return { xpEarned, usedFreeze, streakReset, streak: nextStreak };
      },

      startNewLifeMoment: (storyline) => {
        const state = get();
        const instances = archiveActive(state);
        set({
          instances,
          ...blankActiveFields(),
          storyline,
          activeInstanceId: uuidv4(),
        });
      },
      switchToInstance: (id) => {
        const state = get();
        const instances = archiveActive(state);
        const target = instances.find((i) => i.id === id);
        if (!target) return;
        set({
          instances: instances.filter((i) => i.id !== id),
          activeInstanceId: target.id,
          storyline: target.storyline,
          role: target.role,
          cloudInstanceId: target.cloudInstanceId,
          profile: target.profile,
          currentWeek: target.storyline === 'pregnancy' && target.profile ? calculateWeek(target.profile.lmpDate) : target.currentWeek,
          xp: target.xp,
          level: target.level,
          badges: target.badges,
          checklist: target.checklist,
          lastCheckInDate: target.lastCheckInDate,
          streak: target.streak,
          freezeCards: target.freezeCards,
          lastFreezeGrantWeek: target.lastFreezeGrantWeek,
        });
      },
      archiveActiveAndGoToPicker: () => {
        const state = get();
        const instances = archiveActive(state);
        set({ instances, ...blankActiveFields() });
      },
      cancelOnboarding: () => {
        // 選了人生大事、還沒選完角色就按返回：這條線根本沒有真的資料，直接丟棄不進背包
        set({ ...blankActiveFields() });
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

function archiveActive(state: PregnancyState): LifeMomentInstance[] {
  if (!state.activeInstanceId || !state.storyline) return state.instances;
  const snapshot: LifeMomentInstance = {
    id: state.activeInstanceId,
    storyline: state.storyline,
    role: state.role,
    cloudInstanceId: state.cloudInstanceId,
    profile: state.profile,
    currentWeek: state.currentWeek,
    xp: state.xp,
    level: state.level,
    badges: state.badges,
    checklist: state.checklist,
    lastCheckInDate: state.lastCheckInDate,
    streak: state.streak,
    freezeCards: state.freezeCards,
    lastFreezeGrantWeek: state.lastFreezeGrantWeek,
  };
  const withoutOld = state.instances.filter((i) => i.id !== snapshot.id);
  return [...withoutOld, snapshot];
}
