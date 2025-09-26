-- 修复 jobs 表，添加自动填充 user_id 的触发器
-- 问题：插入 jobs 记录时没有 user_id，但 RLS 策略要求它

-- 创建触发器函数，自动填充 user_id
create or replace function public.jobs_set_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 如果没有提供 user_id，自动设置为当前用户
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

-- 创建触发器
drop trigger if exists jobs_set_user_id_trigger on public.jobs;
create trigger jobs_set_user_id_trigger
before insert on public.jobs
for each row execute procedure public.jobs_set_user_id();

-- 验证触发器已创建
select trigger_name, event_manipulation, action_statement 
from information_schema.triggers 
where event_object_table = 'jobs';
