-- ================================================
-- 为 profiles 表添加 password_hash 字段
-- 用于邮箱+密码认证流程
-- ================================================

-- 1. 添加 password_hash 列（如果不存在）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. 为 password_hash 添加注释
COMMENT ON COLUMN public.profiles.password_hash IS '用户密码哈希（bcrypt），用于密码登录';

-- 3. 确认 profiles 表结构
-- 应包含以下列：
-- - id (uuid, PRIMARY KEY)
-- - email (text, UNIQUE, NOT NULL)
-- - display_name (text)
-- - credits (integer, DEFAULT 0)
-- - password_hash (text)
-- - created_at (timestamp with time zone)

-- 4. 查看当前表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
