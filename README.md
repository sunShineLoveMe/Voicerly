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
- ✅ 自动转录功能已添加到上传组件
- ✅ 错误处理和用户反馈已实现
- 🔄 需要VoxCPM服务在 `http://localhost:7860` 运行

## 使用说明
1. **启动VoxCPM服务**: 确保VoxCPM服务在本地7860端口运行
2. **上传语音样本**: 在生成页面上传5-10秒的音频文件
3. **自动转录**: 点击"自动转录"按钮将音频转换为文本(可选)
4. **输入目标文本**: 在目标文本框中输入要生成的语音内容
5. **调整设置**: 在高级设置中调整CFG值、推理步数等参数
6. **生成语音**: 点击"生成语音"按钮开始合成
7. **下载结果**: 生成完成后可以播放和下载音频文件

## Development Notes
- Components <500 lines, split by feature
- No `any`, no eslint-disable
- Tailwind classes use `cn()` merge
- Deploy on Vercel, env vars in dashboard
- Always show credits usage & reminders

---

👆 `.cursorrules` = 详细执行手册  
👆 `README.md` = 快速回顾摘要
