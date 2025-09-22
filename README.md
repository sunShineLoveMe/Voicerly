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

## Development Notes
- Components <500 lines, split by feature
- No `any`, no eslint-disable
- Tailwind classes use `cn()` merge
- Deploy on Vercel, env vars in dashboard
- Always show credits usage & reminders

---

👆 `.cursorrules` = 详细执行手册  
👆 `README.md` = 快速回顾摘要
