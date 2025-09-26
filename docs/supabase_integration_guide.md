# Supabase 集成使用指南

## 概述
本项目已完整集成 Supabase 数据库，实现了用户认证、积分管理、任务记录等功能。

## 快速开始

### 1. 环境配置
在项目根目录创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. 运行测试
```bash
# 安装依赖
pnpm install

# 运行端到端测试
pnpm ts-node scripts/sb_e2e.ts
```

## 数据库结构

### profiles 表
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  credits int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### credit_transactions 表
```sql
CREATE TABLE credit_transactions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  delta int NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### jobs 表
```sql
CREATE TABLE jobs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  used_credits int NOT NULL DEFAULT 0,
  input_chars int,
  est_seconds int,
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## API 使用示例

### 用户注册和登录
```typescript
// 1. 创建用户 (管理员操作)
const createUserResponse = await fetch('/api/admin/create-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'StrongPass123!'
  })
})

// 2. 用户登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'StrongPass123!'
  })
})

const { data: loginData } = await loginResponse.json()
const accessToken = loginData.access_token
```

### 积分管理
```typescript
// 发放注册奖励
const bonusResponse = await fetch('/api/rpc/grant-signup-bonus', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

// 扣除积分
const deductResponse = await fetch('/api/rpc/deduct-credits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    cost: 10,
    reason: 'tts_generate'
  })
})
```

### 任务记录
```typescript
// 插入任务记录 (user_id 由触发器自动填充)
const jobResponse = await fetch('/rest/v1/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  body: JSON.stringify({
    status: 'done',
    used_credits: 10,
    audio_url: 'https://example.com/a.mp3',
    input_chars: 123,
    est_seconds: 8
  })
})
```

## 前端集成

### 在 React 组件中使用
```typescript
import { useState, useEffect } from 'react'

function VoiceGenerator() {
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)

  // 用户登录
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const { data } = await response.json()
    setUser(data)
    setCredits(data.credits)
  }

  // 生成语音前扣除积分
  const generateVoice = async (text: string) => {
    // 先扣除积分
    const deductResponse = await fetch('/api/rpc/deduct-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.access_token}`
      },
      body: JSON.stringify({
        cost: 10,
        reason: 'tts_generate'
      })
    })

    if (!deductResponse.ok) {
      throw new Error('积分不足')
    }

    // 生成语音...
    const audioUrl = await generateAudio(text)

    // 记录任务
    await fetch('/rest/v1/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        status: 'done',
        used_credits: 10,
        audio_url: audioUrl,
        input_chars: text.length,
        est_seconds: Math.ceil(text.length / 10)
      })
    })
  }

  return (
    <div>
      {user ? (
        <div>
          <p>欢迎, {user.display_name}!</p>
          <p>积分余额: {credits}</p>
          <button onClick={() => generateVoice('Hello world')}>
            生成语音
          </button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}
```

## 错误处理

### 常见错误码
- `UNAUTHORIZED`: 未授权访问
- `VALIDATION_ERROR`: 输入验证失败
- `RPC_ERROR`: RPC 函数调用失败
- `INSUFFICIENT_CREDITS`: 积分不足
- `USER_NOT_FOUND`: 用户不存在

### 错误处理示例
```typescript
try {
  const response = await fetch('/api/rpc/deduct-credits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ cost: 10, reason: 'tts_generate' })
  })

  if (!response.ok) {
    const error = await response.json()
    switch (error.error.code) {
      case 'INSUFFICIENT_CREDITS':
        alert('积分不足，请充值')
        break
      case 'UNAUTHORIZED':
        alert('请先登录')
        break
      default:
        alert('操作失败: ' + error.error.message)
    }
    return
  }

  const { data } = await response.json()
  console.log('新余额:', data.new_balance)
} catch (error) {
  console.error('网络错误:', error)
  alert('网络连接失败，请检查网络设置')
}
```

## 安全注意事项

1. **环境变量安全**
   - 不要在客户端代码中暴露 `SUPABASE_SERVICE_ROLE_KEY`
   - 只在服务器端使用 service role key

2. **RLS 策略**
   - 所有表都启用了行级安全策略
   - 用户只能访问自己的数据
   - 管理员操作使用 service role key 绕过 RLS

3. **输入验证**
   - 所有 API 都使用 Zod 进行输入验证
   - 防止 SQL 注入和 XSS 攻击

4. **错误处理**
   - 不暴露敏感信息给客户端
   - 提供友好的错误提示

## 部署注意事项

1. **环境变量配置**
   - 在 Vercel 或其他平台设置环境变量
   - 确保生产环境使用正确的 Supabase 项目

2. **数据库迁移**
   - 确保生产环境已执行 `docs/supabase_init.sql`
   - 验证 RLS 策略和触发器已正确部署

3. **监控和日志**
   - 监控 API 调用频率和错误率
   - 记录关键操作日志

## 故障排除

### 常见问题

1. **连接超时**
   - 检查网络连接
   - 确认 Supabase URL 正确
   - 检查代理设置

2. **认证失败**
   - 验证 API key 是否正确
   - 检查用户是否存在
   - 确认密码正确

3. **RLS 错误**
   - 确认用户已登录
   - 检查 RLS 策略配置
   - 验证触发器是否正常工作

### 调试工具
- 使用 Supabase Dashboard 查看数据库状态
- 检查浏览器网络面板查看 API 调用
- 使用 `pnpm ts-node scripts/sb_e2e.ts` 运行测试
