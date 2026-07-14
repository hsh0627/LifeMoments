# LifeMoments 架構文件

給任何一台開發機（包含 Claude Code）快速理解現有架構用。程式碼結構、資料流異動時請一併更新此檔。

## 技術棧

- **前端**：React Native + Expo（SDK 54）+ expo-router（file-based routing）+ TypeScript
- **狀態管理**：Zustand（`store/`），`usePregnancyStore` 有用 `persist` middleware 存進 AsyncStorage
- **後端**：Supabase（目前僅用於 Auth：訪客匿名登入 / email 登入註冊；**尚未建立任何資料表**，App 資料還沒同步到雲端，見「已知技術債」）
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
- `storyline`：目前選的人生大事，型別 `Storyline = 'pregnancy'`（未來擴充新類型時要在這裡加）
- `role`：`'mom' | 'dad' | null`，只有 `needsRole: true` 的 storyline 才會用到
- `profile`：懷孕資料（`lmpDate`、`dueDate`）
- `currentWeek`：懷孕週數，`setProfile` 時計算一次，App 重開時 `onRehydrateStorage` 會用當下日期重算（不會卡住不動）
- `xp` / `level`：目前是**單一總量**，還沒有做「每條人生大事分開算」（已在對話中決議要分開算，但尚未實作，見技術債）
- `checklist`：`ChecklistItem[]`，`category: 'checkup' | 'bag'`，`completeChecklistItem(id)` 會同時加 XP、判斷是否解鎖 `checklist_pro` 徽章
- `justLeveledUp`：升等彈窗用的暫時旗標，**不持久化**（`partialize` 排除）

## 關鍵設計檔案

- `lib/lifemoments.ts` — `LIFEMOMENT_CONFIG`：每條人生大事線是否需要角色選擇（`needsRole`），擴充新線時在這裡加設定，不要去改 `_layout.tsx` 的判斷邏輯
- `lib/levels.ts` — 等級稱號 + 主題色，依 `role` 分媽媽線／爸爸線兩套稱號
- `lib/tasks.ts` — 首頁「今日任務」動態產生邏輯：從 `checklist` 依「已過期→即將到來→未來」排序抓出前幾項，依角色套用不同文案框架（爸爸是「提醒／陪同」框架）
- `lib/checklistStatus.ts` — 週數狀態判斷（overdue/soon/future）+ 樣式，首頁跟清單頁共用
- `components/LevelUpModal.tsx` — 監聽 `justLeveledUp`，全域掛在 `(tabs)/_layout.tsx`

## 已知技術債（依優先度）

1. **完全沒有雲端資料同步**：Supabase 只做 Auth，App 資料（懷孕資料、XP、清單進度）只存在本機 AsyncStorage。換裝置/砍 App 重灌會遺失。已規劃資料表設計（見下方「討論中的未來架構」），尚未動工。
2. **XP/等級是全域單一值**：已決議未來要「每條人生大事線分開算」，目前 `usePregnancyStore` 還是單一 `xp`/`level`，之後開放第二條人生大事線時要處理遷移。
3. **無自動化測試**。
4. `npm install` 曾多次因套件 peer dependency 衝突需要 `--legacy-peer-deps`，2026-07-14 已用 `npx expo install --fix` 對齊過一次，之後升級 SDK 建議重新跑 `npx expo install --check`。

## 討論中的未來架構（尚未實作，僅供銜接）

- **多人共用資料**（例如懷孕線的爸拔媽麻）：規劃用 `lifemoment_instances`（一份人生大事實例，含 `invite_code`）+ `lifemoment_members`（誰參與、什麼角色）的方式，讓「配對」變成可選的，而不是綁死在整個資料模型上。單身用的人生大事線（買房/買車/創業）可以不產生邀請碼。
- 詳細討論記錄在對話中，尚未落成程式碼或 schema migration。

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
- 人生大事選擇 → 角色選擇 → 主畫面 三層導覽流程，角色是否需要選可依線設定
- 懷孕週數追蹤（日期選擇器 + 直接輸入模式）
- 產檢／待產包清單，完成給 XP，解鎖徽章
- 首頁「今日任務」依週數動態從清單抓最急迫的項目
- RPG 化：XP／等級／稱號（依角色分媽媽線／爸爸線稱號組）／升等動畫彈窗
- 本機資料持久化（AsyncStorage，App 重開資料不會消失）
- 技術債清理：套件版本對齊、移除 NativeWind/Tailwind

**下一步（排定順序）：**
1. 每日簽到／連續打卡獎勵機制
2. Supabase 資料表設計 + 雲端同步（含多人共用資料的配對機制）
3. XP／等級改成依人生大事線分開計算
4. AI 助理、補助資料庫等核心模組實作
5. 前端體驗打磨（動畫、效能）
