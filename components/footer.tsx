interface FooterProps {
  language: "en" | "zh"
}

export function Footer({ language }: FooterProps) {
  const content = {
    en: {
      disclaimer: "Do not use for illegal or infringing purposes. All generated content is the user's responsibility.",
      copyright: "© 2024 Voicerly. All rights reserved.",
      links: {
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        contact: "Contact",
      },
    },
    zh: {
      disclaimer: "禁止用于违法或侵权用途。生成内容的法律责任由用户自行承担。",
      copyright: "© 2024 Voicerly. 保留所有权利。",
      links: {
        terms: "服务条款",
        privacy: "隐私政策",
        contact: "联系我们",
      },
    },
  }

  const { disclaimer, copyright, links } = content[language]

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Disclaimer Banner */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <p className="text-center text-muted-foreground font-medium">⚠️ {disclaimer}</p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">{copyright}</p>
          <div className="flex items-center space-x-6">
            <a href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              {links.terms}
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              {links.privacy}
            </a>
            <a href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              {links.contact}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
