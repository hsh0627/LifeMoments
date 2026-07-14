# LifeMoments

人生大事紀錄與工具 APP — 幫助你在每個重要人生階段，知道該做什麼、能拿什麼資源、如何一步步完成。

首發模組是「懷孕」，其他人生大事線（結婚、買房、買車...）已在規劃中。

詳細架構、資料模型、產品規劃與目前進度請看 **[ARCHITECTURE.md](./ARCHITECTURE.md)**。

## 技術棧

- 前端：React Native + Expo + expo-router + TypeScript
- 狀態管理：Zustand（含本機持久化）
- 後端：Supabase（目前僅 Auth）

## 開發

```bash
npm install
npx expo start
```

需要 `.env`（參考 `.env.example`）設定 `EXPO_PUBLIC_SUPABASE_URL`、`EXPO_PUBLIC_SUPABASE_ANON_KEY`。
