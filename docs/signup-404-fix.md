# 注册404错误修复指南

## 🔴 问题现象
- 访问 `/signup` 页面
- 填写表单后点击"创建账户"
- Network显示：`POST /api/password-signup` 返回 **404 Not Found**

## 🔍 根本原因
**Supabase `profiles` 表缺少 `password_hash` 字段**

从你的截图看，profiles表只有：
- ✅ id (uuid)
- ✅ email (text)
- ✅ display_name (text)
- ✅ credits (int4)
- ✅ created_at (timestamptz)
- ❌ **password_hash (text)** ← 缺失！

---

## ✅ 修复步骤

### 1️⃣ 立即执行：更新 Supabase 数据库

#### 方法A：在 Supabase Dashboard 执行SQL

1. **打开 Supabase Dashboard**: https://supabase.com/dashboard
2. **选择项目**: lejhjsgalirpnbinbgcc
3. **进入 SQL Editor** (左侧菜单)
4. **新建查询** → **复制粘贴以下SQL** → **Run**

```sql
-- 添加 password_hash 字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 为 email 添加唯一约束
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- 添加注释
COMMENT ON COLUMN public.profiles.password_hash IS '用户密码哈希（bcrypt）';

-- 验证结果
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

#### 方法B：使用项目中的SQL文件

```bash
# 查看完整SQL
cat docs/COMPLETE_profiles_setup.sql

# 复制内容到 Supabase SQL Editor 执行
```

---

### 2️⃣ 验证数据库更新

执行SQL后，在Supabase Table Editor中检查 `profiles` 表，应该看到：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| email | text | 邮箱（唯一） |
| display_name | text | 显示名称 |
| credits | int4 | 积分 |
| created_at | timestamptz | 创建时间 |
| **password_hash** | **text** | **密码哈希（新增）** ✅ |

---

### 3️⃣ 确认 Vercel 部署

代码已推送到GitHub，Vercel会自动重新部署。

**检查部署状态**:
1. 访问 Vercel Dashboard: https://vercel.com
2. 查看最新部署（应该显示 "Building" 或 "Ready"）
3. 等待部署完成（通常1-2分钟）

---

### 4️⃣ 测试注册功能

部署完成后：

1. **清除浏览器缓存** (Ctrl+Shift+R 或 Cmd+Shift+R)
2. **访问**: https://voicerly.zhiyunllm.com/signup
3. **填写表单**:
   - 姓名: `Test User`
   - 邮箱: `test@example.com`
   - 密码: `test1234`（至少8位，含字母+数字）
   - 确认密码: `test1234`
4. **点击"创建账户"**

**预期结果**:
- ✅ Network: `POST /api/password-signup` 返回 `200 OK`
- ✅ 响应: `{ ok: true, user: {...} }`
- ✅ 自动登录并跳转到 `/account`

---

## 🔍 故障排查

### 如果仍然404：

#### A. 检查API路由文件存在
```bash
ls -la app/api/password-signup/
# 应该看到: route.ts
```

#### B. 检查Vercel环境变量
确保设置了：
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... (你的service role key)
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
```

#### C. 查看Vercel部署日志
1. Vercel Dashboard → 你的项目 → Deployments
2. 点击最新部署 → "View Function Logs"
3. 查找错误信息

#### D. 检查浏览器Network
- Request URL 是否正确: `/api/password-signup`
- Request Method: `POST`
- Request Payload: `{ email, password, displayName }`

---

## 🐛 常见错误

### 错误1: "Email already registered"
**原因**: 邮箱已存在  
**解决**: 使用其他邮箱或删除已有用户

### 错误2: "Password must be at least 8 characters"
**原因**: 密码太短  
**解决**: 输入≥8位密码

### 错误3: "Password must contain letters and numbers"
**原因**: 密码太弱  
**解决**: 确保密码包含字母和数字

### 错误4: "SUPABASE_SERVICE_ROLE_KEY is not set"
**原因**: Vercel环境变量未配置  
**解决**: 在Vercel Dashboard设置环境变量

---

## ✅ 成功标志

执行以上步骤后，你应该能：

1. ✅ 在 `/signup` 成功注册新用户
2. ✅ 自动登录并跳转到 `/account`
3. ✅ Supabase `profiles` 表中看到新用户（含 `password_hash`）
4. ✅ 在 `/login?tab=password` 使用邮箱密码登录

---

**如果还有问题，请提供：**
- Vercel部署日志截图
- Supabase profiles表结构截图
- 浏览器Console/Network错误截图
