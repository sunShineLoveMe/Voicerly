# 认证系统验证清单

## 🚀 快速验证步骤

### ✅ 验收标准（按顺序执行）

#### 1️⃣ `/login` - 登录页面
- [ ] 访问 `/login`，页面只显示**两个Tab**：
  - **验证码登录** (Email Code)
  - **密码登录** (Password)
- [ ] **不再出现**注册表单或"创建账号"模块
- [ ] 页面底部有："没有账户？去注册" 链接到 `/signup`

**测试验证码登录：**
- [ ] 输入邮箱 → 点击"发送验证码"
- [ ] Network面板：`POST /api/send-otp` 返回 `200 {ok:true}`
- [ ] 按钮进入60秒倒计时，显示"重新发送(60s)"
- [ ] 输入收到的6位验证码（只允许数字）
- [ ] 点击"验证并登录"
- [ ] Network面板：`POST /api/verify-otp` 返回 `200 {ok:true, user:{...}}`
- [ ] 成功跳转到 `/account`

**测试密码登录：**
- [ ] 切换到"密码登录"Tab（URL变为 `?tab=password`）
- [ ] 输入邮箱+密码
- [ ] 点击"登录"
- [ ] Network面板：`POST /api/password-login` 返回 `200 {ok:true, user:{...}}`
- [ ] 成功跳转到 `/account`
- [ ] 底部有"忘记密码？"链接到 `/forgot-password`

---

#### 2️⃣ `/signup` - 注册页面
- [ ] 访问 `/signup`，页面**只显示密码注册表单**
- [ ] **不出现** OTP 登录模块
- [ ] 表单字段：姓名、邮箱、密码、确认密码
- [ ] 顶部有奖励提示："🎁 注册即可获得10个免费积分"

**测试密码注册：**
- [ ] 姓名：`Test User`
- [ ] 邮箱：`newuser@example.com`（自动trim和toLowerCase）
- [ ] 密码：`test1234`（至少8位，包含字母+数字）
- [ ] 确认密码：`test1234`
- [ ] 点击"创建账户"
- [ ] Network面板：`POST /api/password-signup` 返回 `200 {ok:true, user:{...}}`
- [ ] 成功自动登录并跳转到 `/account`
- [ ] 底部有："已有账户？登录" 链接到 `/login`

**测试表单验证：**
- [ ] 密码不足8位 → 显示错误提示
- [ ] 密码无数字或无字母 → "密码必须包含字母和数字"
- [ ] 两次密码不一致 → "两次密码输入不一致"
- [ ] 邮箱格式错误 → "请输入有效的邮箱地址"

---

#### 3️⃣ `/forgot-password` - 忘记密码
- [ ] 访问 `/forgot-password`，两步流程显示正确

**Step 1: 发送验证码**
- [ ] 输入邮箱 → 点击"发送验证码"
- [ ] Network面板：`POST /api/send-otp` 返回 `200 {ok:true}`
- [ ] 按钮进入60秒冷却
- [ ] UI切换到Step 2

**Step 2: 重置密码**
- [ ] 邮箱显示为禁用状态（灰色背景）
- [ ] 输入6位验证码
- [ ] 输入新密码（至少8位，字母+数字）
- [ ] 点击"重置密码"
- [ ] Network面板：`POST /api/reset-password` 返回 `200 {ok:true}`
- [ ] 显示成功提示："密码重置成功！正在跳转到登录页..."
- [ ] 2秒后跳转到 `/login?tab=password`
- [ ] 使用新密码可以成功登录

---

## 🔍 关键修复验证

### A) Resend 422 修复
- [ ] 所有邮箱输入框自动 `trim()` 和 `toLowerCase()`
- [ ] Network面板中 Request Payload 的 `email` 字段是纯字符串，无空格/换行
- [ ] 不再出现 422 "Invalid 'to' field" 错误

### B) 60秒冷却机制
- [ ] 点击"发送验证码"后，按钮立即禁用
- [ ] 按钮文案变为"重新发送(60s)"并倒计时
- [ ] 倒计时结束后，按钮恢复为"发送验证码"
- [ ] 冷却期间重复点击无效

### C) 验证码输入优化
- [ ] 只允许输入数字（输入字母不生效）
- [ ] 自动限制6位
- [ ] 粘贴时自动截取前6位数字
- [ ] 满6位后可以回车提交（在表单内）

### D) 密码显示切换
- [ ] 密码输入框右侧有眼睛图标
- [ ] 点击切换明文/密文显示
- [ ] 图标在 Eye 和 EyeOff 之间切换

---

## 🌐 环境变量检查

### `.env.local` 必需配置：
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare Worker API（留空则同源）
NEXT_PUBLIC_API_BASE=

# 可选
NEXT_PUBLIC_ENABLE_PASSWORD=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

### 验证环境变量：
- [ ] `NEXT_PUBLIC_API_BASE` 正确（无尾斜杠）
- [ ] 所有API请求带 `credentials: "include"`（检查 `lib/http.ts`）
- [ ] Supabase Service Role Key 已配置

---

## 📱 移动端测试

- [ ] 在手机或DevTools切换到移动视图
- [ ] 所有表单单列显示良好
- [ ] 按钮和输入框尺寸适中，易于点击
- [ ] Tab切换正常
- [ ] 60秒冷却倒计时显示清晰

---

## 🐛 错误处理验证

### 常见错误提示（应使用FormMessage组件，不是alert）：

**邮箱相关：**
- [ ] "Please enter a valid email address"（邮箱格式错误）
- [ ] "Email already registered"（邮箱已存在，注册时）
- [ ] "Invalid email or password"（登录失败）

**验证码相关：**
- [ ] "Please enter a 6-digit code"（验证码格式错误）
- [ ] "Invalid or expired verification code"（验证码错误/过期）
- [ ] "Too many requests"（429，需等待60秒）

**密码相关：**
- [ ] "Password must be at least 8 characters"（密码太短）
- [ ] "Password must contain letters and numbers"（密码弱）
- [ ] "Passwords do not match"（两次密码不一致）

---

## ✅ API 合同验证

使用浏览器 DevTools → Network 检查以下请求：

### 1. `/api/send-otp`
```json
Request: { "email": "user@example.com" }
Response: { "ok": true }
```

### 2. `/api/verify-otp`
```json
Request: { "email": "user@example.com", "code": "123456" }
Response: { "ok": true, "user": {...} }
```

### 3. `/api/password-signup`
```json
Request: { "email": "new@example.com", "password": "pass1234", "displayName": "New User" }
Response: { "ok": true, "user": {...} }
```

### 4. `/api/password-login`
```json
Request: { "email": "user@example.com", "password": "pass1234" }
Response: { "ok": true, "user": {...} }
```

### 5. `/api/reset-password`
```json
Request: { "email": "user@example.com", "code": "123456", "newPassword": "newpass1234" }
Response: { "ok": true }
```

---

## 🎯 最终验收

- [ ] `/login` 只有两个Tab，无注册表单 ✅
- [ ] `/signup` 只有密码注册表单 ✅
- [ ] `/forgot-password` 完整两步流程 ✅
- [ ] OTP 冷却60s正确 ✅
- [ ] 所有错误有清晰提示（FormMessage）✅
- [ ] API调用严格按合同 ✅
- [ ] `credentials: include` 生效 ✅
- [ ] 邮箱自动trim/toLowerCase，无422错误 ✅
- [ ] 密码规则：≥8位，字母+数字 ✅
- [ ] TypeScript无严重报错 ✅
- [ ] 移动端单列良好 ✅

---

## 🚨 常见问题排查

### Q1: "Invalid 'to' field" (422)
**解决**: 检查邮箱是否包含空格/换行，确认已 `trim().toLowerCase()`

### Q2: "Too many requests" (429)
**解决**: 
1. 等待60秒
2. 或清除 Cloudflare KV: `throttle:e:<email>`, `throttle:ip:<ip>`

### Q3: "Invalid or expired verification code"
**解决**:
1. 检查验证码是否过期（通常5-10分钟）
2. 重新发送验证码
3. 确认邮箱地址一致（区分大小写已修复）

### Q4: OTP登录成功但无法自动注册
**解决**: 检查 `/api/verify-otp` Worker 后端是否支持自动注册逻辑

### Q5: 密码重置验证码验证失败
**解决**: 确认 `/api/reset-password` 正确调用 `/api/verify-otp` 验证

---

**测试完成后，所有功能应符合以上标准！** ✨
