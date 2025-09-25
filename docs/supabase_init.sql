-- 0) Extension
create extension if not exists pgcrypto;

-- 1) Tables
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  display_name text,
  credits int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id bigserial primary key,
  user_id uuid not null,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id bigserial primary key,
  user_id uuid not null,
  status text not null default 'queued',
  used_credits int not null default 0,
  input_chars int,
  est_seconds int,
  audio_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_credit_tx_user on public.credit_transactions(user_id);
create index if not exists idx_jobs_user on public.jobs(user_id);

-- 2) Enable RLS
alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.jobs enable row level security;

-- 3) Policies  (修正版：每个动作单独一条 policy)

-- profiles：仅本人可读
drop policy if exists "profiles_select_owner" on public.profiles;
create policy "profiles_select_owner"
on public.profiles
for select
using (auth.uid() = id);

-- credit_transactions：本人可读 + 本人可写（插入）
drop policy if exists "credit_tx_select_owner" on public.credit_transactions;
create policy "credit_tx_select_owner"
on public.credit_transactions
for select
using (auth.uid() = user_id);

drop policy if exists "credit_tx_insert_owner" on public.credit_transactions;
create policy "credit_tx_insert_owner"
on public.credit_transactions
for insert
with check (auth.uid() = user_id);

-- jobs：本人可读 + 本人可写（插入）
drop policy if exists "jobs_select_owner" on public.jobs;
create policy "jobs_select_owner"
on public.jobs
for select
using (auth.uid() = user_id);

drop policy if exists "jobs_insert_owner" on public.jobs;
create policy "jobs_insert_owner"
on public.jobs
for insert
with check (auth.uid() = user_id);

-- 4) Trigger: auth.users -> profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 5) Guard: block direct credits update (non service_role)
create or replace function public.block_direct_credit_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  role text := coalesce(jwt->>'role', '');
begin
  if tg_op = 'UPDATE' then
    if new.credits <> old.credits and role <> 'service_role' then
      raise exception 'direct credit updates are not allowed';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_credit_update on public.profiles;
create trigger trg_block_credit_update
before update on public.profiles
for each row execute procedure public.block_direct_credit_update();

-- 6) RPCs
-- 6.1 signup bonus (idempotent)
create or replace function public.grant_signup_bonus()
returns table (new_balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bonus int := 50;
  already boolean;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1 from public.credit_transactions
    where user_id = uid and reason = 'signup_bonus'
  ) into already;

  if already then
    return query select credits from public.profiles where id = uid;
  end if;

  update public.profiles
     set credits = credits + bonus
   where id = uid;

  insert into public.credit_transactions (user_id, delta, reason)
  values (uid, bonus, 'signup_bonus');

  return query select credits from public.profiles where id = uid;
end;
$$;

-- 6.2 deduct credits (atomic)
create or replace function public.deduct_credits(cost int, reason text)
returns table (new_balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if cost <= 0 then
    raise exception 'cost must be positive';
  end if;

  select credits into bal from public.profiles where id = uid for update;
  if bal is null then
    raise exception 'profile not found';
  end if;
  if bal < cost then
    raise exception 'insufficient_credits';
  end if;

  update public.profiles
     set credits = credits - cost
   where id = uid;

  insert into public.credit_transactions (user_id, delta, reason)
  values (uid, -cost, coalesce(reason,'tts_generate'));

  return query select credits from public.profiles where id = uid;
end;
$$;

-- 6.3 update display name
create or replace function public.update_profile(p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles set display_name = p_display_name where id = uid;
end;
$$;

-- 7) Grants
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

grant select, insert on table public.credit_transactions to authenticated;
grant select, insert on table public.jobs to authenticated;

grant execute on function public.grant_signup_bonus() to authenticated;
grant execute on function public.deduct_credits(int, text) to authenticated;
grant execute on function public.update_profile(text) to authenticated;

-- 8) Echo state
select tab.relname as table, pol.polname as policy_name, pol.cmd as cmd, pol.permissive
from pg_policy pol
join pg_class tab on pol.polrelid = tab.oid
where tab.relname in ('profiles','credit_transactions','jobs')
order by tab.relname, pol.polname;

select n.nspname as schema, p.proname as function
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public' and p.proname in ('grant_signup_bonus','deduct_credits','update_profile');
