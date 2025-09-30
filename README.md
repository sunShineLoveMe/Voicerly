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
- ✅ **首页 CTA 引导** - 未登录用户点击 CTA 跳转注册，已登录用户自动隐藏按钮
- ✅ **站点图标配置** - 设置 favicon.ico 与 Apple Touch Icon，浏览器标签显示品牌图标
- ✅ **无密码登录** - 支持邮箱验证码登录，带防滥用倒计时、国际化提示、Turnstile 校验

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
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server-side: Vercel Function 代理到 Cloudflare Tunnel
VOXCPM_BASE_URL=https://voxcpm.zhiyunllm.com

# Client-side: 前端同源基路径（交给代理）
NEXT_PUBLIC_VOXCPM_BASE=/api/voxcpm

# 健康检查开关（生产环境默认关闭）
NEXT_PUBLIC_ENABLE_HEALTH_CHECK=1

# 调试模式
NEXT_PUBLIC_DEBUG_MODE=1
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

### 🎨 用户体验优化 (新增)

#### ✅ 已实现优化
- **渐进式认证** - 用户可以先浏览页面内容，在需要时才提示登录
- **智能提示** - 根据用户操作（上传文件、生成音频）显示相应的登录提示
- **优雅的错误处理** - 使用 Toast 组件显示登录/注册错误信息
- **真实认证集成** - 登录/注册页面连接到 Supabase API
- **表单验证优化** - 移除原生 alert，使用优雅的 Toast 提示
- **登录功能修复** - 修复登录按钮无反应和错误提示问题
- **忘记密码页面** - 创建完整的忘记密码功能页面
- **API 模块修复** - 修复 Supabase 客户端模块导入问题
- **错误处理优化** - 完善登录错误提示和 Toast 显示
- **Toast 组件集成** - 在根布局中添加 Toaster 组件
- **登录状态管理** - 修复按钮加载状态和错误处理逻辑
- **FAQ 内容更新** - 更新常见问题页面，确保信息准确性和及时性

#### 🎯 优化后的用户体验
1. **访问 `/generate` 页面**：
   - ✅ 未登录用户可以看到完整的页面内容
   - ✅ 显示试用积分（50积分）
   - ✅ 可以浏览所有功能和参数设置

2. **用户实际操作时**：
   - 📁 **上传音频文件** → 弹出登录对话框
   - 🎵 **点击生成音频** → 弹出登录对话框
   - 💬 **智能提示文案** → 根据操作显示相应的提示

3. **登录/注册体验**：
   - 🎨 **优雅的错误提示** → 使用 Toast 组件显示错误
   - 🔄 **真实 API 集成** → 连接到 Supabase 后端
   - ✅ **自动登录** → 注册成功后自动登录
   - 📝 **表单验证优化** → 移除原生 alert，使用 Toast 提示

4. **表单验证体验**：
   - ❌ **之前** → 原生 alert 弹窗（灰色系统对话框）
   - ✅ **现在** → 优雅的 Toast 提示（右上角滑入动画）
   - 🎯 **验证场景** → 密码长度、必填字段、邮箱格式等

5. **登录功能修复**：
   - ✅ **登录按钮响应** → 移除模拟延迟，立即响应
   - ✅ **错误提示显示** → 使用 Toast 组件显示错误信息
   - ✅ **成功提示** → 登录成功后显示欢迎消息
   - ✅ **忘记密码页面** → 创建完整的密码重置流程

6. **API 和模块修复**：
   - ✅ **Supabase 客户端** → 转换为 ES 模块格式
   - ✅ **API 响应格式** → 修复用户数据结构
   - ✅ **错误处理** → 完善 401 错误处理
   - ✅ **模块导入** → 修复 TypeScript 导入问题

7. **Toast 和状态管理修复**：
   - ✅ **Toaster 组件** → 在根布局中添加全局 Toast 组件
   - ✅ **错误提示显示** → 修复 Toast 不显示的问题
   - ✅ **按钮状态管理** → 修复登录按钮加载状态
   - ✅ **异步错误处理** → 完善错误抛出和状态重置逻辑

8. **FAQ 内容全面更新**：
   - ✅ **信息准确性** → 更新所有技术规格和功能描述
   - ✅ **用户体验** → 添加账户创建、参数说明等新问题
   - ✅ **商业使用** → 明确商业用途和法律合规要求
   - ✅ **技术支持** → 完善问题解决方案和联系方式

#### 🛠️ 新增组件
- `components/auth-dialog.tsx` - 登录提示对话框
- `components/error-toast.tsx` - 错误提示组件
- `app/forgot-password/page.tsx` - 忘记密码页面
- 优化的登录/注册页面集成真实 API

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
- [x] **用户体验优化** - 改进认证流程，让用户先看到页面内容
- [x] **前端集成** - 将注册/登录表单连接到后端 API

### 🔄 进行中
- [x] **用户体验优化** - 改进认证流程，让用户先看到页面内容 ✅
- [x] **前端集成** - 将注册/登录表单连接到后端 API ✅
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

## 🚀 部署指南

### 环境变量配置

#### 必需的环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 外部后端代理配置
NEXT_PUBLIC_API_BASE=https://your-public-backend.example.com
```

#### 可选的环境变量
```bash
# 健康检查开关（生产环境默认关闭）
NEXT_PUBLIC_ENABLE_HEALTH_CHECK=1

# 调试模式
NEXT_PUBLIC_DEBUG_MODE=1
```

### 外部后端代理

- **统一入口**: 所有外部后端请求统一走相对路径 `/api/*`（不要写绝对域名）
- **Next.js 代理**: 在 `next.config.js` 中通过 `rewrites` 把 `/api/*` 代理到 `NEXT_PUBLIC_API_BASE` 指定的地址
- **生产环境设置**:
  - `NEXT_PUBLIC_API_BASE=https://your-public-backend.example.com`
  - 可选：`NEXT_PUBLIC_ENABLE_HEALTH_CHECK=1` （默认关闭健康检查）
- **内部 API Routes**: 如 `/api/auth/*` 不经过代理，不要改它们的路径

### Vercel 部署

1. **连接 GitHub 仓库**:
   ```bash
   vercel login
   vercel --prod
   ```

2. **配置环境变量**:
   - 在 Vercel 控制台 → Project Settings → Environment Variables
   - 添加所有必需的环境变量

3. **配置自定义域名**:
   - 在 Vercel 控制台 → Domains
   - 添加子域名（如 `voicerly.zhiyunllm.com`）
   - 在 Namecheap 中配置 DNS 记录指向 Vercel

4. **CORS 配置**:
   - 确保外部后端 CORS 白名单包含：
     - `https://voicerly.zhiyunllm.com`
     - `https://*.vercel.app`

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 测试部署

1. **本地测试**:
   ```bash
   pnpm dev
   # 访问 http://localhost:3000
   # 检查网络面板 /api/* 是否正确命中代理
   ```

2. **生产测试**:
   - 访问 `https://voicerly.zhiyunllm.com`
   - 检查网络面板 `/api/*` 指向外部后端
   - 确认无 CORS 报错
   - 测试登录/注册功能
   - 测试语音生成功能

3. **代理验证**:
   ```bash
   # 验证代理是否正常工作
   curl https://voicerly.zhiyunllm.com/api/voxcpm/config
   # 应该返回 VoxCPM 服务的配置信息
   ```

### 🔄 VoxCPM 代理配置

#### 环境变量说明
- **VOXCPM_BASE_URL**: 服务端环境变量，指向 Cloudflare Tunnel 地址
- **NEXT_PUBLIC_VOXCPM_BASE**: 客户端环境变量，前端使用相对路径 `/api/voxcpm`

#### 代理工作原理
1. **前端请求**: 所有 VoxCPM API 请求都发送到 `/api/voxcpm/*`
2. **Next.js 代理**: 通过 `pages/api/voxcpm/[...path].ts` 或 `app/api/voxcpm/[...path]/route.ts` 代理
3. **转发到上游**: 代理将请求转发到 `VOXCPM_BASE_URL` 指定的地址
4. **流式响应**: 支持流式数据传输，保持原始响应格式

#### 本地开发设置
1. **启动 VoxCPM 服务**: 确保在本地 7860 端口运行
2. **设置环境变量**: 在 `.env.local` 中配置 `VOXCPM_BASE_URL=http://localhost:7860`
3. **测试代理**: 访问 `http://localhost:3000/api/voxcpm/config` 验证代理工作

#### 生产环境设置
1. **Vercel 环境变量**: 在 Vercel 控制台设置 `VOXCPM_BASE_URL=https://voxcpm.zhiyunllm.com`
2. **Cloudflare Tunnel**: 确保 VoxCPM 服务通过 Cloudflare Tunnel 可访问
3. **CORS 配置**: 确保上游服务允许来自 Vercel 域名的请求

## 📞 支持与联系
- **测试报告**: `docs/supabase_sdk_test_report.md`
- **集成指南**: `docs/supabase_integration_guide.md`
- **API 示例**: `docs/supabase_examples_via_api.http`
- **问题排查**: `docs/network_troubleshooting.md`

---

👆 `.cursorrules` = 详细执行手册  
👆 `README.md` = 快速回顾摘要
