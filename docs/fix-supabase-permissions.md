# 修复 Supabase 权限错误 (403 permission error)

## 🔴 问题现象
- 注册时报错：`code: 403, message: "permission error"`
- 错误类型：`exceptions.UserAuthError`
- Supabase 表已有 `password_hash` 字段

## 🔍 根本原因
**Supabase RLS (Row Level Security) 策略阻止了数据插入**

---

## ✅ 修复步骤

### 第1步：检查 Vercel 环境变量

1. **打开 Vercel Dashboard**: https://vercel.com/dashboard
2. **进入你的项目** → **Settings** → **Environment Variables**
3. **确认以下变量存在且正确**：

```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key  # ⚠️ 最重要！
```

**如何获取这些值：**
1. Supabase Dashboard → 你的项目
2. **Settings** → **API**
3. 复制：
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (需点击"Reveal"显示) → `SUPABASE_SERVICE_ROLE_KEY`

---

### 第2步：临时禁用 RLS (测试用)

在 **Supabase Dashboard → SQL Editor** 执行：

```sql
-- 临时禁用 profiles 表的 RLS，用于测试注册
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 验证
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- rowsecurity 应该显示 false
```

⚠️ **注意**：这只是临时测试方案，成功后需要重新启用RLS并配置正确的策略！

---

### 第3步：配置正确的 RLS 策略（推荐）

如果第2步能让注册成功，说明确实是RLS问题。然后执行：

```sql
-- 重新启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人插入新用户（注册）
CREATE POLICY "Allow public insert for signup" 
ON public.profiles 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 创建策略：用户只能查看和更新自己的数据
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 创建策略：Service Role 可以做任何操作
CREATE POLICY "Service role has full access" 
ON public.profiles 
TO service_role
USING (true)
WITH CHECK (true);

-- 验证策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';
```

---

### 第4步：检查 Service Role Key 使用

确认代码正确使用 Service Role Key：

**检查文件：** `app/api/password-signup/route.ts`

应该看到：
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

✅ 这样才能绕过 RLS 限制

---

## 🧪 测试步骤

### A. 快速测试（禁用RLS后）
1. 执行第2步SQL（禁用RLS）
2. 等待1分钟让Vercel重新部署
3. 清除浏览器缓存
4. 重新注册测试

### B. 正确配置（启用RLS + 策略）
1. 执行第3步SQL（配置策略）
2. 测试注册是否成功
3. 测试登录是否成功
4. 检查用户只能访问自己的数据

---

## 🔍 故障排查

### 如果仍然403：

#### 检查1：Vercel环境变量
```bash
# 在 Vercel Dashboard → Settings → Environment Variables
# 确保 SUPABASE_SERVICE_ROLE_KEY 已设置且正确
```

#### 检查2：Service Role Key 格式
```bash
# Service Role Key 应该是一个很长的字符串
# 格式类似：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 开头是 eyJ，非常长（几百个字符）
```

#### 检查3：RLS 状态
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
```

#### 检查4：查看 Vercel Function 日志
1. Vercel Dashboard → 你的项目
2. Deployments → 最新部署
3. Functions → password-signup
4. 查看详细错误日志

---

## ✅ 成功标志

修复后应该：
1. ✅ 注册成功，无403错误
2. ✅ Supabase profiles 表中看到新用户
3. ✅ password_hash 字段已正确存储
4. ✅ 自动登录并跳转 /account

---

## 📝 安全建议

1. **生产环境必须启用RLS**
2. **配置精确的策略**（按第3步）
3. **Service Role Key 只在服务端使用**
4. **定期审查权限策略**
