-- 修正 lifemoment_members 的 RLS 政策造成無限遞迴的問題
-- 在 Supabase SQL Editor 執行

drop policy if exists "members can view membership" on lifemoment_members;

create policy "users can view own membership"
  on lifemoment_members for select
  using (user_id = auth.uid());
