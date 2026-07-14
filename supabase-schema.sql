-- LifeMoments 資料庫 schema
-- 在 Supabase Dashboard -> SQL Editor 貼上執行
-- 設計採「lifemoment 實例」架構，讓配對（例如懷孕線的爸拔媽麻共用資料）之後可以選配加上去，
-- 這一版先只支援單人自動建立 instance，尚未做邀請碼加入流程。

create extension if not exists "pgcrypto";

-- 一份「人生大事」的實例（例如某對情侶的懷孕紀錄）
create table if not exists lifemoment_instances (
  id uuid primary key default gen_random_uuid(),
  lifemoment_type text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  invite_code text unique,
  created_at timestamptz not null default now()
);

-- 誰參與這份實例、擔任什麼角色
create table if not exists lifemoment_members (
  instance_id uuid not null references lifemoment_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  joined_at timestamptz not null default now(),
  primary key (instance_id, user_id)
);

-- 懷孕資料（未來其他 lifemoment_type 可以各自開對應的資料表）
create table if not exists pregnancy_profiles (
  instance_id uuid primary key references lifemoment_instances(id) on delete cascade,
  lmp_date date,
  due_date date,
  updated_at timestamptz not null default now()
);

-- 清單完成狀態（產檢/待產包），item_id 對應前端 lib 裡寫死的清單項目 id
create table if not exists checklist_items (
  instance_id uuid not null references lifemoment_instances(id) on delete cascade,
  item_id text not null,
  done boolean not null default false,
  done_by uuid references auth.users(id),
  done_at timestamptz,
  primary key (instance_id, item_id)
);

-- 個人進度（XP、等級、徽章、簽到），每個人在每個 instance 裡各自累積
create table if not exists user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  instance_id uuid not null references lifemoment_instances(id) on delete cascade,
  xp int not null default 0,
  level int not null default 1,
  badges text[] not null default '{}',
  streak int not null default 0,
  freeze_cards int not null default 0,
  last_check_in_date date,
  last_freeze_grant_week text,
  updated_at timestamptz not null default now(),
  primary key (user_id, instance_id)
);

-- Row Level Security：只有該 instance 的成員可以讀寫
alter table lifemoment_instances enable row level security;
alter table lifemoment_members enable row level security;
alter table pregnancy_profiles enable row level security;
alter table checklist_items enable row level security;
alter table user_progress enable row level security;

create policy "members can view their instances"
  on lifemoment_instances for select
  using (exists (select 1 from lifemoment_members m where m.instance_id = id and m.user_id = auth.uid()));

create policy "users can create instances"
  on lifemoment_instances for insert
  with check (created_by = auth.uid());

create policy "members can view membership"
  on lifemoment_members for select
  using (exists (select 1 from lifemoment_members m where m.instance_id = instance_id and m.user_id = auth.uid()));

create policy "users can add themselves as member"
  on lifemoment_members for insert
  with check (user_id = auth.uid());

create policy "members can view profile"
  on pregnancy_profiles for select
  using (exists (select 1 from lifemoment_members m where m.instance_id = pregnancy_profiles.instance_id and m.user_id = auth.uid()));

create policy "members can upsert profile"
  on pregnancy_profiles for insert
  with check (exists (select 1 from lifemoment_members m where m.instance_id = pregnancy_profiles.instance_id and m.user_id = auth.uid()));

create policy "members can update profile"
  on pregnancy_profiles for update
  using (exists (select 1 from lifemoment_members m where m.instance_id = pregnancy_profiles.instance_id and m.user_id = auth.uid()));

create policy "members can view checklist"
  on checklist_items for select
  using (exists (select 1 from lifemoment_members m where m.instance_id = checklist_items.instance_id and m.user_id = auth.uid()));

create policy "members can upsert checklist"
  on checklist_items for insert
  with check (exists (select 1 from lifemoment_members m where m.instance_id = checklist_items.instance_id and m.user_id = auth.uid()));

create policy "members can update checklist"
  on checklist_items for update
  using (exists (select 1 from lifemoment_members m where m.instance_id = checklist_items.instance_id and m.user_id = auth.uid()));

create policy "users can view own progress"
  on user_progress for select
  using (user_id = auth.uid());

create policy "users can upsert own progress"
  on user_progress for insert
  with check (user_id = auth.uid());

create policy "users can update own progress"
  on user_progress for update
  using (user_id = auth.uid());
