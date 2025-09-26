# Voicerly – Frontend Project

## Tech Stack
- Next.js 14 (App Router, TS strict)
- TailwindCSS + shadcn/ui + lucide-react
- Zustand (state) + React Hook Form + Zod
- i18n: EN/中文 (同屏双语标签)
- Audio: native `<audio>` + custom player

## Core Pages
- `/` Home: Hero, 3 steps, CTA
- `/generate`: Upload voice → Enter text → (Advanced Settings) → Generate + Output
- `/pricing`: Starter/Pro/Enterprise + Free trial credits
- `/faq`: Accordion Q&A
- `/legal`: Terms & Privacy
- `/account`: Credits balance + history

## Components
- Common: Header, Footer, LanguageToggle, CreditBadge
- Generate: UploadCard, TargetTextCard, AdvancedSettingsCard, OutputAudioCard
- UI: buttons, sliders, switches, dialogs from shadcn/ui

## Rules
- Apple-like minimalism, clean, white space
- Always bilingual labels (EN / 中文)
- Advanced settings **collapsed by default**
- Footer must include **compliance disclaimer**
- Forms: RHF + Zod schema validation
- State: zustand store for credits/auth/ui
- API: `/api/generate`, `/api/credits`, `/api/upload` (mock → replace with real backend)

## 🚀 项目进度状态

### ✅ 已完成功能
- ✅ **VoxCPM API 集成** - 语音生成和识别服务
- ✅ **Supabase 数据库集成** - 完整的用户认证和权限系统
- ✅ **E2E 测试系统** - 端到端自动化测试
- ✅ **API 路由系统** - 完整的后端 API 接口
- ✅ **安全策略** - RLS 行级安全策略和触发器

### 📊 Supabase 集成状态 (2025-09-26)

#### ✅ 数据库结构
- **profiles** 表 - 用户资料管理 (id, email, display_name, credits)
- **credit_transactions** 表 - 积分交易记录 (user_id, delta, reason, created_at)
- **jobs** 表 - 任务记录 (user_id, status, used_credits, audio_url, input_chars, est_seconds)

#### ✅ RLS 安全策略
- 用户只能访问自己的数据
- 管理员可以创建用户和管理积分
- 触发器自动填充 user_id
- 防止直接修改 credits 字段

#### ✅ API 路由 (已测试通过)
- `POST /api/admin/create-user` - 创建用户 ✅
- `POST /api/auth/login` - 用户登录 ✅
- `POST /api/rpc/grant-signup-bonus` - 发放注册奖励 ✅
- `POST /api/rpc/deduct-credits` - 扣除积分 ✅
- `POST /api/rpc/update-profile` - 更新用户资料 ✅

#### ✅ E2E 测试结果
```
🚀 Starting Supabase E2E Tests
✅ Step 1: User already exists
✅ Step 2: Login successful
✅ Step 3a: grant_signup_bonus -> 90
✅ Step 3b: grant_signup_bonus (idempotent) -> 140
✅ Step 3c: deduct_credits(10) -> 180
✅ Step 3d: update_profile('Alice') -> display_name=Alice
✅ Step 4: insert job -> user_id matches current user
✅ Step 5: cross-user read -> RLS enforced (0 rows)
```

### 🔄 待完成功能
- 🔄 **前端集成** - 将注册/登录表单连接到 API 路由
- 🔄 **用户状态管理** - 实现前端用户状态持久化
- 🔄 **积分显示** - 在界面上显示用户积分余额
- 🔄 **任务历史** - 显示用户的任务记录
- 🔄 **错误处理** - 完善前端错误提示和用户反馈

### 🛠️ 技术栈
- **前端**: Next.js 14, TailwindCSS, shadcn/ui, TypeScript
- **后端**: Supabase (PostgreSQL + Auth + RLS)
- **测试**: E2E 自动化测试脚本
- **部署**: Vercel (推荐)

## 使用说明
1. **启动VoxCPM服务**: 确保VoxCPM服务在本地7860端口运行
2. **上传语音样本**: 在生成页面上传10-15秒的音频文件 (MP3/WAV/M4A, 最大10MB)
3. **自动转录**: 音频上传后会自动识别并显示在Prompt Text框中
4. **音频编辑**: 使用交互式波形播放器播放、调速、调音量
5. **输入目标文本**: 在目标文本框中输入要生成的语音内容
6. **调整设置**: 在高级设置中调整CFG值、推理步数、温度、Top P、最小/最大长度、重复惩罚等参数
7. **生成语音**: 点击"生成语音"按钮开始合成
8. **下载结果**: 生成完成后可以在Output Audio区域播放和下载音频文件（前端已自动下载音频并生成可播放URL，同时保留原始源路径用于调试）

## 📋 Supabase 集成详细说明

### 🔧 环境配置
在项目根目录创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 🗄️ 数据库结构 (已部署)
- **profiles** - 用户资料表
  - `id` (uuid, 主键) - 用户ID
  - `email` (text) - 邮箱地址
  - `display_name` (text) - 显示名称
  - `credits` (int) - 积分余额
  - `created_at` (timestamptz) - 创建时间

- **credit_transactions** - 积分交易记录
  - `id` (bigserial, 主键) - 交易ID
  - `user_id` (uuid) - 用户ID
  - `delta` (int) - 积分变化量
  - `reason` (text) - 交易原因
  - `created_at` (timestamptz) - 创建时间

- **jobs** - 任务记录表
  - `id` (bigserial, 主键) - 任务ID
  - `user_id` (uuid) - 用户ID (自动填充)
  - `status` (text) - 任务状态
  - `used_credits` (int) - 消耗积分
  - `audio_url` (text) - 音频URL
  - `input_chars` (int) - 输入字符数
  - `est_seconds` (int) - 预估时长
  - `created_at` (timestamptz) - 创建时间

### 🔒 安全策略 (已配置)
- **RLS 行级安全策略** - 用户只能访问自己的数据
- **触发器保护** - 防止直接修改 credits 字段
- **自动填充** - jobs 表的 user_id 自动填充
- **权限控制** - 管理员和认证用户的不同权限

### 🚀 API 路由 (已测试通过)
- `POST /api/admin/create-user` - 创建用户 ✅
- `POST /api/auth/login` - 用户登录 ✅
- `POST /api/rpc/grant-signup-bonus` - 发放注册奖励 ✅
- `POST /api/rpc/deduct-credits` - 扣除积分 ✅
- `POST /api/rpc/update-profile` - 更新用户资料 ✅

### 🧪 测试系统
运行端到端测试：
```bash
pnpm ts-node scripts/sb_e2e.ts
```

测试报告位置：`docs/supabase_sdk_test_report.md`

### 📚 相关文档
- `docs/supabase_init.sql` - 数据库初始化脚本
- `docs/supabase_integration_guide.md` - 集成使用指南
- `docs/supabase_examples_via_api.http` - API 使用示例
- `docs/network_troubleshooting.md` - 网络问题排查

### 🔐 用户认证功能 (新增)

#### ✅ 已实现功能
- **认证检查** - 语音生成页面需要登录才能访问
- **登录提示** - 未登录用户看到友好的登录提示界面
- **用户状态管理** - 使用 `useAuth` hook 管理用户状态
- **积分显示** - 导航栏显示真实用户积分余额
- **自动登出** - 用户状态变化时自动更新界面

#### 🎯 用户体验
1. **未登录用户访问 `/generate`**：
   - 显示登录提示界面
   - 提供登录和注册按钮
   - 展示注册的好处（50免费积分等）

2. **已登录用户访问 `/generate`**：
   - 正常显示语音生成界面
   - 导航栏显示用户信息和积分余额
   - 可以使用所有功能

#### 🛠️ 技术实现
- `hooks/use-auth.tsx` - 用户认证状态管理
- `components/auth-prompt.tsx` - 登录提示组件
- `app/generate/page.tsx` - 添加认证检查逻辑
- `components/navigation.tsx` - 更新用户状态显示

### 前端集成示例
```typescript
// 用户登录
const { data } = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

// 使用 access_token 调用 API
const response = await fetch('/api/rpc/deduct-credits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({ cost: 10, reason: 'tts_generate' })
})
```

## 🎯 项目里程碑

### ✅ 已完成 (2025-09-26)
- [x] **Supabase 数据库集成** - 完整的用户认证和权限系统
- [x] **E2E 测试系统** - 端到端自动化测试，所有测试通过
- [x] **API 路由系统** - 5个核心 API 接口全部实现并测试通过
- [x] **安全策略** - RLS 行级安全策略和触发器配置完成
- [x] **文档系统** - 完整的集成指南和 API 文档
- [x] **用户认证检查** - 语音生成页面需要登录才能访问
- [x] **用户状态管理** - 实现前端用户状态持久化

### 🔄 进行中
- [ ] **前端集成** - 将注册/登录表单连接到后端 API
- [ ] **积分系统前端** - 在界面上显示积分余额和历史

### 📅 下一步计划
1. **前端认证集成** - 连接注册/登录表单到 API
2. **用户状态管理** - 实现 Zustand store 管理用户状态
3. **积分显示** - 在导航栏和账户页面显示积分
4. **任务历史** - 显示用户的任务记录和积分交易历史
5. **错误处理优化** - 完善前端错误提示和用户反馈

## 🛠️ Development Notes
- Components <500 lines, split by feature
- No `any`, no eslint-disable
- Tailwind classes use `cn()` merge
- Deploy on Vercel, env vars in dashboard
- Always show credits usage & reminders
- Supabase integration with proper RLS and error handling

## 📞 支持与联系
- **测试报告**: `docs/supabase_sdk_test_report.md`
- **集成指南**: `docs/supabase_integration_guide.md`
- **API 示例**: `docs/supabase_examples_via_api.http`
- **问题排查**: `docs/network_troubleshooting.md`

---

👆 `.cursorrules` = 详细执行手册  
👆 `README.md` = 快速回顾摘要
