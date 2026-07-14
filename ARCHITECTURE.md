# LifeMoments 架構文件

給任何一台開發機（包含 Claude Code）快速理解現有架構用。程式碼結構、資料流異動時請一併更新此檔。

## 技術棧

- **前端**：React Native + Expo（SDK 54）+ expo-router（file-based routing）+ TypeScript
- **狀態管理**：Zustand（`store/`），`usePregnancyStore` 有用 `persist` middleware 存進 AsyncStorage
- **後端**：Supabase（Auth：訪客匿名登入 / email 登入註冊；資料表見 `supabase-schema.sql`，已上線並接了雲端同步，見「資料模型」）
- **樣式**：純 inline style（`StyleSheet`/inline object），**沒有** NativeWind/Tailwind（2026-07-14 已移除）
- **字型**：DotGothic16（像素風格），部分畫面用系統字型避免 CJK 亂碼

## 導覽流程（Navigation Gating）

App 進入 tabs 前有三層守門邏輯，都在 `app/(tabs)/_layout.tsx`：

```
未登入 (session === null)
  → Redirect 到 /(auth)/welcome

已登入，但 storyline === null
  → <StorylineSelectScreen />（選人生大事：懷孕／買房🔒／買車🔒...）

已登入，storyline 已選，但該 storyline 需要角色且 role === null
  → <RoleSelectScreen />（選爸拔／媽麻，僅懷孕線需要，見 lib/lifemoments.ts）

以上都滿足
  → 正常 <Tabs>（首頁／懷孕／清單／我的）
```

`app/index.tsx`、`app/(auth)/welcome.tsx`、`app/(auth)/login.tsx` 都各自監聽 `useAuthStore.session`，session 一旦變化就會用 `<Redirect>` 主動導頁——**不要移除這些檢查**，之前拿掉會導致登出/登入後卡住無法導頁（因為 expo-router 的畫面replace後，舊畫面不會留著反應式監聽）。

## 資料模型（目前僅本機，Zustand + AsyncStorage）

### `store/useAuthStore.ts`
Supabase session 的本地鏡像，來源是 `app/_layout.tsx` 的 `onAuthStateChange` 監聽（不持久化，App 重開由 `supabase.auth.getSession()` 重新取得，Supabase session 本身已透過 `lib/supabase.ts` 設定 `persistSession: true` 存在 AsyncStorage）。

### `store/usePregnancyStore.ts`（**已持久化**，key: `lifemoments-pregnancy-store`）

採「一條使用中 + 背包」的多實例架構：

- **使用中的那一條線**（跟舊版欄位一樣，畫面元件直接讀這些）：`storyline`、`role`、`cloudInstanceId`、`profile`、`currentWeek`、`xp`、`level`、`badges`、`checklist`、`lastCheckInDate`、`streak`、`freezeCards`、`lastFreezeGrantWeek`
- `instances: LifeMomentInstance[]` — **背包**，存放「之前開始過、目前沒在看」的其他人生大事線完整快照（同樣的欄位組合）
- `activeInstanceId` — 目前使用中那條線的本機 id，**同時也是它在 Supabase `lifemoment_instances.id` 的值**（前端自己產生 UUID，insert 時直接帶入，見 `lib/cloudSync.ts`，避免 RLS「還沒建立成員關係就讀不到剛新增的列」的問題）
- 切換動作：
  - `startNewLifeMoment(storyline)` — 開全新一條線，目前這條（如果有）先存進 `instances[]`，**不會刪除**
  - `switchToInstance(id)` — 切回背包裡某一條，同樣會先把目前這條存回背包
  - `archiveActiveAndGoToPicker()` — 把目前這條收進背包，回到 `StorylineSelectScreen`（Profile／TitleScreen 的「切換人生大事」都是呼叫這個，**不是刪除**）
  - `cancelOnboarding()` — 只用在「選了人生大事、還沒選完角色」就按返回的情境：因為這條線根本沒有真實資料，直接丟棄、不進背包
- `currentWeek`：懷孕週數，`setProfile` 時計算一次，App 重開時 `onRehydrateStorage` 會用當下日期重算（不會卡住不動）
- `xp` / `level`：每個 instance（每條人生大事線）各自獨立計算，不會共用（已按之前決議實作）
- `checklist`：`ChecklistItem[]`，`category: 'checkup' | 'bag'`，`completeChecklistItem(id)` 會同時加 XP、判斷是否解鎖 `checklist_pro` 徽章
- `justLeveledUp`：升等彈窗用的暫時旗標，**不持久化**（`partialize` 排除）

**目前限制**：只有「懷孕」是真正做出來的人生大事線，所以 `startNewLifeMoment` 實際上只有一種可能的 `storyline` 值可傳。多線背包的架構已經就緒，但**沒有第二條真線可以實際端到端測試**，等之後開放第二條線時要留意這點。

### `lib/cloudSync.ts` — Supabase 雲端同步

- `bootstrapCloudSync(userId)`：進入 tabs、storyline 確定後呼叫一次。查得到雲端 `lifemoment_members` 記錄就把雲端資料拉回覆蓋本機；查不到就用 `activeInstanceId` 當 id 在雲端建一筆新的（instance + membership + push 目前本機資料）
- `pushToCloud(userId)`：把目前使用中那條線整包 upsert 到 `pregnancy_profiles` / `checklist_items` / `user_progress`
- `startAutoSync`：訂閱 `usePregnancyStore`，任何變化 debounce 1.5 秒後自動 `pushToCloud`，不用在每個功能點手動呼叫
- **已知限制**：只有「使用中」的那條線會同步雲端；`instances[]` 背包裡封存的線目前**不會**跨裝置同步（只存在本機 AsyncStorage），換裝置或砍 App 重灌會遺失背包內容（使用中的那條沒問題）。之後如果要補，`switchToInstance`/`archiveActiveAndGoToPicker` 觸發時應該也呼叫一次 push/pull。

### Supabase Schema（`supabase-schema.sql` / `supabase-fix-rls.sql`）

- `lifemoment_instances` / `lifemoment_members` / `pregnancy_profiles` / `checklist_items` / `user_progress`，都有 RLS
- **注意**：`lifemoment_members` 自己的 SELECT policy 不能寫成查自己表本身的 subquery（會無限遞迴，2026-07-14 修過一次），已改成單純 `user_id = auth.uid()`
- 尚未實作：邀請碼配對機制（多人共用同一個 instance）。`invite_code` 欄位已經建了，但沒有產生/輸入邀請碼的畫面或程式邏輯

## 關鍵設計檔案

- `lib/lifemoments.ts` — `LIFEMOMENT_CONFIG`：每條人生大事線是否需要角色選擇（`needsRole`），擴充新線時在這裡加設定，不要去改 `_layout.tsx` 的判斷邏輯
- `lib/levels.ts` — 等級稱號 + 主題色，依 `role` 分媽媽線／爸爸線兩套稱號
- `lib/tasks.ts` — 首頁「今日任務」動態產生邏輯：從 `checklist` 依「已過期→即將到來→未來」排序抓出前幾項，依角色套用不同文案框架（爸爸是「提醒／陪同」框架）
- `lib/checklistStatus.ts` — 週數狀態判斷（overdue/soon/future）+ 樣式，首頁跟清單頁共用
- `lib/cloudSync.ts` — Supabase 雲端同步（見上方專節）
- `components/LevelUpModal.tsx` — 監聽 `justLeveledUp`，全域掛在 `(tabs)/_layout.tsx`
- `components/TitleScreen.tsx` — 每次進 App（session-scoped，不持久化）先看到的標題畫面，「繼續冒險」才進 tabs；也是「切換人生大事」「登出」的入口
- `components/StorylineSelectScreen.tsx` — 選人生大事，同時顯示背包裡「繼續之前的冒險」清單

## 已知技術債（依優先度）

1. **背包裡封存的人生大事線沒有雲端同步**：只有使用中那條線會同步 Supabase，見上方 `lib/cloudSync.ts` 限制說明。
2. **無自動化測試**。
3. `npm install` 曾多次因套件 peer dependency 衝突需要 `--legacy-peer-deps`，2026-07-14 已用 `npx expo install --fix` 對齊過一次，之後升級 SDK 建議重新跑 `npx expo install --check`。
4. **多人配對機制未實作**：`invite_code` 欄位已建但沒有對應功能，見上方 Schema 專節。

---

# 產品規劃

## 核心模組（跨所有人生大事線）

1. **人生大事模組**：預設計畫清單（checklist）+ 進度追蹤、備註／紀錄（文字、照片）、各大事的流程引導
2. **AI 助理**：問答（自然語言）、導引到 App 內對應功能、串接補助資料庫回答、輔助預算規劃試算 —— 首頁已預留入口（`Lv.3` 解鎖），功能本身尚未實作
3. **補助資訊資料庫**：涵蓋政府＋民間補助，依人生大事分類，提供取得方式，需持續更新機制 —— 尚未開始
4. **預算管理（後期）**：設定總預算、各項目實際開銷紀錄、AI 預算試算、預算 vs 實際對比 —— 尚未開始

## 首發模組：懷孕（目前唯一已開放的人生大事線）

- ✅ 週數計算器（末次月經日期或直接輸入幾週幾天）
- ✅ 產檢行程清單（依週數自動標示已過期／即將到來／未來）
- ✅ 待產包清單
- ✅ 依角色（媽麻／爸拔）顯示不同任務框架
- ⬜ 醫院／診所記錄
- ⬜ 媽媽教室資訊（免費課程、活動）
- ⬜ 月子中心／產後護理之家資訊
- ⬜ 產檢紀錄（數值、照片）、寶寶成長日記、孕媽咪症狀紀錄
- ⬜ 台灣生育補助查詢（生育補助、育兒津貼、產假／陪產假規定、勞保生育給付）

## 已規劃但未開放的人生大事線

育兒、結婚、買房、買車、搬家、創業/轉職、退休規劃、寵物 —— 選單已預留（`components/StorylineSelectScreen.tsx`），點擊顯示「開發中」，順序可在畫面上用「編輯順序」拖曳調整（本機持久化）。

## 進度追蹤（2026-07-14 更新）

**已完成：**
- 訪客／email 登入註冊、登出保護（session 消失自動導回登入）
- 標題畫面（TitleScreen）→ 人生大事選擇 → 角色選擇 → 主畫面 導覽流程，角色是否需要選可依線設定
- 懷孕週數追蹤（日期選擇器 + 直接輸入模式）
- 產檢／待產包清單，完成給 XP，解鎖徽章
- 首頁「今日任務」依週數動態從清單抓最急迫的項目
- RPG 化：XP／等級／稱號（依角色分媽媽線／爸爸線稱號組）／升等動畫彈窗
- 每日簽到／連續打卡（含補簽卡機制，每週自動補發 1 張）
- 本機資料持久化（AsyncStorage，App 重開資料不會消失）
- Supabase 雲端同步（使用中的那條線，見 `lib/cloudSync.ts`）
- 多人生大事線背包架構：可以開新線、切換、封存都不刪資料（`switchToInstance` / `startNewLifeMoment` / `archiveActiveAndGoToPicker`），每條線 XP/等級各自獨立
- 技術債清理：套件版本對齊、移除 NativeWind/Tailwind

**下一步（排定順序）：**
1. 多人共用資料的配對機制（邀請碼加入同一個 instance，`invite_code` 欄位已建但沒接功能）
2. 背包裡封存的人生大事線也要同步雲端（目前只有使用中的那條會同步）
3. AI 助理、補助資料庫等核心模組實作
4. 前端體驗打磨（動畫、效能）
