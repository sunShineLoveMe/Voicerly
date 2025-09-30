-- ============================================
-- 完整配置 profiles 表（用于密码认证）
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 添加 password_hash 字段（如果不存在）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. 为 email 添加唯一约束（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- 4. 添加字段注释
COMMENT ON COLUMN public.profiles.password_hash IS '用户密码哈希（bcrypt），用于密码登录';
COMMENT ON COLUMN public.profiles.email IS '用户邮箱（唯一，用于登录）';

-- 5. 验证表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. 检查约束
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- ============================================
-- 执行成功后，profiles表应包含：
-- ✅ id (uuid, PRIMARY KEY)
-- ✅ email (text, UNIQUE, NOT NULL)
-- ✅ display_name (text)
-- ✅ credits (int4, DEFAULT 0)
-- ✅ created_at (timestamptz)
-- ✅ password_hash (text)
-- ============================================
