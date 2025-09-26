# 网络连接问题排查指南

## 问题描述
在运行 Supabase E2E 测试时遇到连接超时错误：
```
ConnectTimeoutError: Connect Timeout Error
TypeError: fetch failed
```

## 可能的原因

### 1. 代理设置问题
如果你在使用代理（如 Clash、Surge 等），Node.js 可能无法正确使用系统代理。

**解决方案：**
```bash
# 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1

# 然后重新运行测试
pnpm ts-node scripts/sb_e2e.ts
```

### 2. 网络防火墙
企业网络或防火墙可能阻止了到 Supabase 的连接。

**解决方案：**
- 检查防火墙设置
- 尝试使用不同的网络环境（如手机热点）
- 联系网络管理员

### 3. DNS 解析问题
DNS 可能无法正确解析 Supabase 域名。

**解决方案：**
```bash
# 测试 DNS 解析
nslookup lejhjsgalirpnbinbgcc.supabase.co

# 尝试使用不同的 DNS
export NODE_OPTIONS="--dns-result-order=ipv4first"
```

## 替代测试方法

### 方法 1: 使用 Next.js 开发服务器
```bash
# 启动开发服务器
pnpm dev

# 在另一个终端测试 API
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"StrongPass123!"}'
```

### 方法 2: 使用浏览器测试
1. 启动开发服务器：`pnpm dev`
2. 打开浏览器访问：`http://localhost:3000`
3. 使用浏览器开发者工具测试 API 调用

### 方法 3: 使用 Postman 或 Insomnia
使用 `docs/supabase_examples_via_api.http` 文件中的示例进行测试。

## 验证 Supabase 配置

### 1. 检查环境变量
```bash
# 确认环境变量正确加载
cat .env.local
```

### 2. 验证 Supabase 项目状态
- 登录 Supabase Dashboard
- 检查项目是否正常运行
- 确认 API 密钥是否正确

### 3. 测试 Supabase 连接
```bash
# 使用 curl 测试（如果网络允许）
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://lejhjsgalirpnbinbgcc.supabase.co/rest/v1/
```

## 预期结果

如果网络连接正常，E2E 测试应该显示：

```
🚀 Starting Supabase E2E Tests
📧 Test Email: test@example.com
🔑 Test Password: StrongPass123!
==================================================

📝 Step 1: Create or get test user
✅ Step 1: User created successfully
   Data: {"userId": "uuid-string"}

🔐 Step 2: Login user and get access token
✅ Step 2: Login successful
   Data: {"accessToken": "jwt-token", "userId": "uuid-string"}

🔧 Step 3: Test RPC functions
✅ Step 3a: grant_signup_bonus -> 50
✅ Step 3b: grant_signup_bonus (idempotent) -> 50
✅ Step 3c: deduct_credits(10) -> 40
✅ Step 3d: update_profile('Alice') -> display_name=Alice

📋 Step 4: Test jobs insertion and RLS
✅ Step 4: insert job -> user_id matches current user

🔒 Step 5: Test cross-user RLS enforcement
✅ Step 5: cross-user read -> RLS enforced (0 rows)

📄 Report saved to: docs/supabase_sdk_test_report.md
```

## 下一步

一旦网络连接问题解决，你就可以：

1. **运行完整的 E2E 测试**
2. **集成前端界面** - 将注册/登录表单连接到 API 路由
3. **部署到生产环境** - 确保生产环境的环境变量正确配置

## 联系支持

如果问题持续存在，请：
1. 检查 Supabase 服务状态：https://status.supabase.com/
2. 查看 Supabase 文档：https://supabase.com/docs
3. 联系 Supabase 支持团队
