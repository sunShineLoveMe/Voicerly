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

## API Integration Status
- ✅ VoxCPM API 客户端已集成 (`lib/api-client.ts`)
- ✅ 语音生成API已接入 (`/generate` 接口)
- ✅ 语音识别API已接入 (`/prompt_wav_recognition` 接口)
- ✅ **自动转录功能** - 上传音频后自动识别文字
- ✅ 交互式音频波形播放器 (拖拽、播放控制、音量调节)
- ✅ 错误处理和用户反馈已实现
- ✅ **Supabase 数据库集成** - 用户认证、积分管理、任务记录
- 🔄 需要VoxCPM服务在 `http://localhost:7860` 运行

## 使用说明
1. **启动VoxCPM服务**: 确保VoxCPM服务在本地7860端口运行
2. **上传语音样本**: 在生成页面上传10-15秒的音频文件 (MP3/WAV/M4A, 最大10MB)
3. **自动转录**: 音频上传后会自动识别并显示在Prompt Text框中
4. **音频编辑**: 使用交互式波形播放器播放、调速、调音量
5. **输入目标文本**: 在目标文本框中输入要生成的语音内容
6. **调整设置**: 在高级设置中调整CFG值、推理步数、温度、Top P、最小/最大长度、重复惩罚等参数
7. **生成语音**: 点击"生成语音"按钮开始合成
8. **下载结果**: 生成完成后可以在Output Audio区域播放和下载音频文件（前端已自动下载音频并生成可播放URL，同时保留原始源路径用于调试）

## Supabase 集成说明

### 环境配置
在项目根目录创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lejhjsgalirpnbinbgcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 数据库结构
- **profiles**: 用户资料表 (id, email, display_name, credits)
- **credit_transactions**: 积分交易记录 (user_id, delta, reason)
- **jobs**: 任务记录表 (user_id, status, used_credits, audio_url)

### RLS 策略
- 用户只能访问自己的数据
- 管理员可以创建用户和管理积分
- 触发器自动填充 user_id

### API 路由
- `POST /api/admin/create-user` - 创建用户
- `POST /api/auth/login` - 用户登录
- `POST /api/rpc/grant-signup-bonus` - 发放注册奖励
- `POST /api/rpc/deduct-credits` - 扣除积分
- `POST /api/rpc/update-profile` - 更新用户资料

### 测试脚本
运行端到端测试：
```bash
pnpm ts-node scripts/sb_e2e.ts
```

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

## Development Notes
- Components <500 lines, split by feature
- No `any`, no eslint-disable
- Tailwind classes use `cn()` merge
- Deploy on Vercel, env vars in dashboard
- Always show credits usage & reminders
- Supabase integration with proper RLS and error handling

---

👆 `.cursorrules` = 详细执行手册  
👆 `README.md` = 快速回顾摘要
