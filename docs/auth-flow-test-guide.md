# 认证流程测试指南

## 📋 前置准备

### 1. 环境变量配置
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare Worker OTP 服务（留空则使用同源）
NEXT_PUBLIC_API_BASE=

# VoxCPM 代理配置
VOXCPM_BASE_URL=https://voxcpm.zhiyunllm.com
NEXT_PUBLIC_VOXCPM_BASE=/api/voxcpm
```

### 2. 数据库准备
执行 SQL 脚本添加 `password_hash` 字段：
```bash
# 在 Supabase Dashboard SQL Editor 中执行
# 文件位置: docs/supabase_add_password_hash.sql
```

### 3. 安装依赖
```bash
pnpm install
```

---

## 🧪 测试场景

### 场景 1: 邮箱验证码 + 密码注册

#### 步骤：
1. 访问 `/signup`（如果从 OTP 登录跳转会携带 `?email=xxx`）
2. 在注册卡片中：
   - 输入姓名
   - 输入邮箱（若已预填则无需修改）
   - 点击"发送验证码"
   - 检查网络面板：`POST /api/send-otp` 应返回 `{ok: true}`
3. 查收邮件，获取 6 位验证码
4. 输入验证码
5. 输入密码：`testpass123`（至少 8 位，含字母和数字）
6. 点击"创建账户"（Create Account）
7. 检查网络面板：
   - `POST /api/password-signup` → 创建用户并校验验证码
8. 成功后跳转到 `/login?tab=password`

#### 预期结果：
- ✅ Toast 提示验证码发送成功
- ✅ 注册完成后自动跳转到密码登录页
- ✅ Supabase `profiles` 表中新增一条记录，包含 `password_hash`
- ✅ 新用户默认 `credits = 10`

---

### 场景 2: 邮箱密码登录

#### 步骤：
1. 访问 `/login`
2. 在 "Welcome Back" 卡片中：
   - 邮箱：`test@example.com`
   - 密码：`testpass123`
   - 点击"登录"（Sign In）
3. 检查网络面板：`POST /api/auth/login-with-password`

#### 预期结果：
- ✅ Toast 提示"登录成功"
- ✅ 跳转到 `/account`
- ✅ 导航栏显示用户信息和积分

---

### 场景 3: 邮箱验证码登录（OTP Login）

#### 步骤：
1. 访问 `/login`
2. 在 "Email Login" 卡片中：
   - 输入邮箱：`test@example.com`
   - 点击"发送验证码"
   - 输入收到的 6 位验证码
   - 点击"验证并继续"
3. 检查 `EmailOtpForm` 组件的 `onSuccess` 回调

#### 预期结果：
- ✅ Toast 提示"验证成功"
- ✅ 跳转到 `/account`
- ✅ 使用验证通过的邮箱自动登录

---

### 场景 4: 忘记密码（OTP + 重置密码）

#### 步骤：
1. 访问 `/forgot-password`
2. **第一步：邮箱验证**
   - 输入邮箱：`test@example.com`
   - 点击"发送验证码"
   - 输入 6 位验证码
   - 点击"验证并继续"
3. **第二步：设置新密码**
   - 验证成功后，界面切换到密码重置表单
   - 新密码：`newpass456`（至少 8 位）
   - 点击"重置密码"（Reset Password）
4. 检查网络面板：`POST /api/auth/reset-password`

#### 预期结果：
- ✅ Toast 提示"密码重置成功"
- ✅ 自动跳转到 `/login`
- ✅ 使用新密码 `newpass456` 可以成功登录

---

## 🔍 调试技巧

### 1. 网络面板检查
打开浏览器开发者工具 → Network 标签：

#### OTP 相关请求：
```
POST /api/send-otp
Request: { email: "test@example.com" }
Response: { ok: true }

POST /api/verify-otp
Request: { email: "test@example.com", code: "123456" }
Response: { ok: true }
```

#### 认证相关请求：
```
POST /api/auth/signup
Request: { email, password, displayName }
Response: { ok: true, user: {...} }

POST /api/auth/login-with-password
Request: { email, password }
Response: { ok: true, user: {...} }

POST /api/auth/reset-password
Request: { email, newPassword }
Response: { ok: true }
```

### 2. 控制台日志
如有错误，检查：
- `bcrypt` 相关错误 → 确认已安装 `bcryptjs`
- `Supabase` 相关错误 → 检查环境变量和 Service Role Key
- `OTP` 相关错误 → 检查 Cloudflare Worker 配置和 `NEXT_PUBLIC_API_BASE`

### 3. 数据库检查
在 Supabase Dashboard → Table Editor → `profiles`：
- 确认 `password_hash` 字段存在
- 查看用户记录是否正确插入
- 验证 `email` 字段是否唯一

---

## 🐛 常见问题

### Q1: "Email already registered" 错误
**原因**: 邮箱已存在于 `profiles` 表  
**解决**: 删除测试用户或使用其他邮箱

### Q2: "Failed to send verification code"
**原因**: Cloudflare Worker `/api/send-otp` 未配置  
**解决**: 检查 `NEXT_PUBLIC_API_BASE` 环境变量，确保 Worker 正常运行

### Q3: "Password must be at least 8 characters"
**原因**: 密码长度不足  
**解决**: 输入至少 8 个字符的密码

### Q4: "Invalid email or password"
**原因**: 密码错误或用户不存在  
**解决**: 
- 检查邮箱是否已注册
- 确认密码输入正确
- 查看 Supabase `profiles` 表中 `password_hash` 是否存在

### Q5: OTP 验证码发送失败
**原因**: Worker API 路径不正确  
**解决**:
- 本地开发：确保 Worker 在运行并设置正确的 `NEXT_PUBLIC_API_BASE`
- 生产环境：设置 Worker 域名如 `https://otp.workers.dev`

---

## ✅ 测试清单

- [ ] 邮箱验证码 + 密码注册流程完整
- [ ] 邮箱密码登录功能正常
- [ ] 邮箱验证码登录（OTP Only）正常
- [ ] 忘记密码 → OTP 验证 → 重置密码流程完整
- [ ] 验证码 60 秒冷却正常
- [ ] 密码强度提示显示正确
- [ ] Toast 错误提示友好准确
- [ ] 数据库 `password_hash` 正确存储
- [ ] 自动登录跳转正常
- [ ] 多语言（EN/中文）切换正常

---

## 📝 测试用例示例

| 场景 | 输入 | 预期输出 |
|------|------|----------|
| 注册新用户 | email: `new@test.com`, password: `pass1234`, name: `New User` | 创建成功，自动登录 |
| 重复注册 | email: `new@test.com` (已存在) | Toast: "Email already registered" |
| 密码登录 | email: `new@test.com`, password: `pass1234` | 登录成功，跳转 `/account` |
| 密码错误 | email: `new@test.com`, password: `wrong` | Toast: "Invalid email or password" |
| OTP 登录 | email: `new@test.com`, code: `123456` (有效) | 登录成功，跳转 `/account` |
| OTP 错误 | email: `new@test.com`, code: `000000` (无效) | Toast: "Verification failed" |
| 重置密码 | email: `new@test.com`, OTP: `123456`, newPassword: `newpass999` | 重置成功，跳转 `/login` |

---

**测试完成后，记得更新 README.md 的"已完成功能"部分！** 🎉
