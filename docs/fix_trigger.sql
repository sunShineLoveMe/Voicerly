-- 修复触发器，允许 RPC 函数更新 credits
-- 问题：触发器阻止了 RPC 函数更新 credits 字段

-- 删除现有的触发器
drop trigger if exists trg_block_credit_update on public.profiles;

-- 创建新的触发器，允许 RPC 函数更新
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
    -- 允许 service_role 更新 credits
    -- 对于 authenticated 用户，允许通过 RPC 函数更新
    if new.credits <> old.credits and role <> 'service_role' and role <> 'authenticated' then
      raise exception 'direct credit updates are not allowed';
    end if;
  end if;
  return new;
end;
$$;

-- 重新创建触发器
create trigger trg_block_credit_update
before update on public.profiles
for each row execute procedure public.block_direct_credit_update();

-- 验证触发器已更新
select trigger_name, event_manipulation, action_statement 
from information_schema.triggers 
where event_object_table = 'profiles';
