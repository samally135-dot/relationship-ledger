-- 在 Supabase SQL Editor 執行此檔案
create table if not exists public.relationship_ledgers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default '匿名訪客' check (char_length(nickname) <= 24),
  category text not null check (category in ('親情','友情','愛情','其他')),
  investment text not null check (char_length(investment) <= 2000),
  return_value text not null check (char_length(return_value) <= 2000),
  expectation text not null default '' check (char_length(expectation) <= 2000),
  message text not null default '' check (char_length(message) <= 2000),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.relationship_ledgers enable row level security;

-- 所有人只能讀取公開帳本；投稿者可讀取自己的私人帳本
create policy "read public or own ledgers"
on public.relationship_ledgers for select
to authenticated
using (is_public = true or owner_id = auth.uid());

-- 僅能以自己的匿名登入身分新增帳本
create policy "insert own ledgers"
on public.relationship_ledgers for insert
to authenticated
with check (owner_id = auth.uid());

-- 僅能修改或刪除自己建立的帳本
create policy "update own ledgers"
on public.relationship_ledgers for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "delete own ledgers"
on public.relationship_ledgers for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists relationship_ledgers_public_created_idx
on public.relationship_ledgers (is_public, created_at desc);

grant select, insert, update, delete on public.relationship_ledgers to authenticated;