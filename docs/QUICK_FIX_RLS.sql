-- ⚡ 快速修复：Supabase 权限错误
-- 在 Supabase Dashboard → SQL Editor 中执行

-- ============================================
-- 方案A：临时禁用 RLS（快速测试）
-- ============================================

-- 1. 禁用 profiles 表的 RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. 验证状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- rowsecurity 应该显示 false

-- ⚠️ 注意：这只是临时方案！测试成功后请执行方案B


-- ============================================
-- 方案B：正确配置 RLS 策略（推荐）
-- ============================================

-- 1. 重新启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public insert for signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;

-- 3. 创建新策略

-- 允许任何人注册（插入新用户）
CREATE POLICY "Allow public insert for signup" 
ON public.profiles 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 允许 Service Role 完全访问（用于后端API）
CREATE POLICY "Service role has full access" 
ON public.profiles 
TO service_role
USING (true)
WITH CHECK (true);

-- 用户只能查看自己的数据
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. 验证策略已创建
SELECT 
  policyname, 
  cmd,
  roles::text
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;


-- ============================================
-- 验证完整配置
-- ============================================

-- 检查表结构
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 检查RLS状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 检查所有策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles::text, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';


-- ============================================
-- 执行说明
-- ============================================

-- 步骤1：先执行方案A（禁用RLS）测试注册
-- 步骤2：如果注册成功，说明确实是RLS问题
-- 步骤3：执行方案B（配置正确的策略）
-- 步骤4：重新测试注册和登录

-- ✅ 执行成功标志：
-- - rowsecurity = false（方案A）或 true（方案B）
-- - 策略列表显示4个策略（方案B）
-- - 注册成功，无403错误
