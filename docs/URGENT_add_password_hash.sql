-- ⚠️ 紧急：添加 password_hash 字段到 profiles 表
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 添加 password_hash 列
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. 添加注释
COMMENT ON COLUMN public.profiles.password_hash IS '用户密码哈希（bcrypt），用于密码登录';

-- 3. 验证表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 执行成功后，应该看到以下字段：
-- id (uuid)
-- email (text)
-- display_name (text)
-- credits (integer)
-- created_at (timestamp with time zone)
-- password_hash (text) ← 新增
