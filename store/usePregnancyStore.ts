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

export type ChecklistCategory =
  | 'checkup'   // 產檢
  | 'bag'       // 待產包
  | 'shopping'  // 用品採購
  | 'postpartum' // 坐月子
  | 'finance'   // 財務
  | 'naming'    // 命名登記
  | 'subsidy'   // 補助
  | 'childcare'; // 公幼申請

export type PregnancyStage = 'early' | 'mid' | 'late' | 'postpartum_stage';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  stage: PregnancyStage;
  title: string;
  done: boolean;
  xp: number;
  week?: number;
  completedAt?: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // 孕早期（0-12週）
  { id: 'c1', category: 'checkup', stage: 'early', title: '初診（確認懷孕）', done: false, xp: 30, week: 6 },
  { id: 's1', category: 'subsidy', stage: 'early', title: '領媽媽手冊＋免費孕婦用品/店家資源', done: false, xp: 15, week: 8 },
  { id: 'c2', category: 'checkup', stage: 'early', title: '8-12週 第一孕期超音波', done: false, xp: 20, week: 8 },
  { id: 'f1', category: 'finance', stage: 'early', title: '告知公司懷孕、了解產檢假規定', done: false, xp: 10, week: 10 },
  { id: 's2', category: 'subsidy', stage: 'early', title: '了解生育補助/育兒津貼申請資格', done: false, xp: 10, week: 10 },
  { id: 'c3', category: 'checkup', stage: 'early', title: '11-13週 唐氏症篩檢', done: false, xp: 20, week: 11 },

  // 孕中期（13-27週）
  { id: 'c4', category: 'checkup', stage: 'mid', title: '20週 大排畸超音波', done: false, xp: 25, week: 20 },
  { id: 'n1', category: 'naming', stage: 'mid', title: '開始討論寶寶名字', done: false, xp: 10, week: 16 },
  { id: 'p1', category: 'postpartum', stage: 'mid', title: '比較坐月子方式（月子中心 vs 月嫂）', done: false, xp: 15, week: 18 },
  { id: 'p2', category: 'postpartum', stage: 'mid', title: '熱門月子中心先卡位預約', done: false, xp: 20, week: 20 },
  { id: 'c5', category: 'checkup', stage: 'mid', title: '24-28週 妊娠糖尿病篩查', done: false, xp: 20, week: 24 },
  { id: 'f2', category: 'finance', stage: 'mid', title: '規劃寶寶保單', done: false, xp: 15, week: 22 },
  { id: 'sh1', category: 'shopping', stage: 'mid', title: '採購大件用品（嬰兒床、汽座、推車）', done: false, xp: 20, week: 24 },
  { id: 'cc1', category: 'childcare', stage: 'mid', title: '了解公幼/托育申請時程', done: false, xp: 10, week: 26 },

  // 孕晚期（28-40週）
  { id: 'c6', category: 'checkup', stage: 'late', title: '35-37週 乙型鏈球菌篩查', done: false, xp: 20, week: 35 },
  { id: 'b1', category: 'bag', stage: 'late', title: '孕婦手冊、健保卡、身分證', done: false, xp: 10 },
  { id: 'b2', category: 'bag', stage: 'late', title: '換洗衣物（3套）', done: false, xp: 10 },
  { id: 'b3', category: 'bag', stage: 'late', title: '產褥墊', done: false, xp: 5 },
  { id: 'b4', category: 'bag', stage: 'late', title: '母乳墊', done: false, xp: 5 },
  { id: 'b5', category: 'bag', stage: 'late', title: '寶寶衣物（新生兒 2-3套）', done: false, xp: 10 },
  { id: 'b6', category: 'bag', stage: 'late', title: '包巾 2條', done: false, xp: 5 },
  { id: 'b7', category: 'bag', stage: 'late', title: '濕紙巾', done: false, xp: 5 },
  { id: 'b8', category: 'bag', stage: 'late', title: '充電器', done: false, xp: 5 },
  { id: 'c7', category: 'checkup', stage: 'late', title: '確認生產醫院/生產計畫', done: false, xp: 15, week: 32 },
  { id: 'f3', category: 'finance', stage: 'late', title: '申請育嬰留職停薪', done: false, xp: 15, week: 34 },
  { id: 'p3', category: 'postpartum', stage: 'late', title: '確認月子中心/月嫂最終安排', done: false, xp: 10, week: 34 },
  { id: 'n2', category: 'naming', stage: 'late', title: '準備新生兒出生登記文件', done: false, xp: 10, week: 36 },
  { id: 'sh2', category: 'shopping', stage: 'late', title: '採購消毒鍋、奶瓶等哺乳用品', done: false, xp: 15, week: 36 },

  // 產後
  { id: 'n3', category: 'naming', stage: 'postpartum_stage', title: '辦理出生登記（7天內）', done: false, xp: 20 },
  { id: 's3', category: 'subsidy', stage: 'postpartum_stage', title: '申請生育給付/育兒津貼', done: false, xp: 20 },
  { id: 'c8', category: 'checkup', stage: 'postpartum_stage', title: '新生兒疫苗接種時程', done: false, xp: 10 },
  { id: 'cc2', category: 'childcare', stage: 'postpartum_stage', title: '公幼/托育正式報名', done: false, xp: 10 },
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
  createdAt: number;
}

interface PregnancyState {
  // 背包：目前沒有在看、但之前已經開始過的人生大事線
  instances: LifeMomentInstance[];
  activeInstanceId: string | null;
  activeCreatedAt: number | null;

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
  /** 從背包永久刪除某一條線（不會刪雲端資料，只是本機不再顯示） */
  removeInstance: (id: string) => void;
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
    activeCreatedAt: null as number | null,
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
        set({ storyline, activeInstanceId: uuidv4(), activeCreatedAt: Date.now() });
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
        const nextChecklist = checklist.map((i) => (i.id === id ? { ...i, done: true, completedAt: Date.now() } : i));
        set({ checklist: nextChecklist });
        get().addXP(item.xp);
        const stage = item.stage;
        const stageItems = nextChecklist.filter((i) => i.stage === stage);
        const badgeId = `stage_${stage}_done`;
        if (stageItems.every((i) => i.done) && !badges.includes(badgeId)) {
          get().unlockBadge(badgeId);
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
          activeCreatedAt: Date.now(),
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
          activeCreatedAt: target.createdAt,
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
      removeInstance: (id) => {
        const { instances } = get();
        set({ instances: instances.filter((i) => i.id !== id) });
      },
      archiveActiveAndGoToPicker: () => {
        const state = get();
        const instances = archiveActive(state);
        const previousRole = state.role;
        set({ instances, ...blankActiveFields(), role: previousRole });
      },
      cancelOnboarding: () => {
        // 選了人生大事、還沒選完角色就按返回：這條線根本沒有真的資料，直接丟棄不進背包
        set({ ...blankActiveFields() });
      },
    }),
    {
      name: 'lifemoments-pregnancy-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 4,
      partialize: (state) => {
        const { justLeveledUp, ...persisted } = state;
        return persisted;
      },
      migrate: (persistedState) => {
        const state = persistedState as PregnancyState;
        const migrateChecklist = (checklist: ChecklistItem[] | undefined) => {
          const doneMap = new Map((checklist ?? []).map((i) => [i.id, { done: i.done, completedAt: i.completedAt }]));
          return DEFAULT_CHECKLIST.map((item) => {
            const prev = doneMap.get(item.id);
            return { ...item, done: prev?.done ?? false, completedAt: prev?.completedAt };
          });
        };
        if (state?.checklist) {
          state.checklist = migrateChecklist(state.checklist);
        }
        if (state?.instances) {
          state.instances = state.instances.map((inst) => ({
            ...inst,
            createdAt: inst.createdAt ?? Date.now(),
            checklist: migrateChecklist(inst.checklist),
          }));
        }
        if (state?.activeInstanceId && !state.activeCreatedAt) {
          state.activeCreatedAt = Date.now();
        }
        return state;
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
    createdAt: state.activeCreatedAt ?? Date.now(),
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
