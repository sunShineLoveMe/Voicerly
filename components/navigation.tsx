"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface NavigationProps {
  language: "en" | "zh"
  onLanguageChange: (lang: "en" | "zh") => void
}

export function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  console.log("language切换", language)

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const navItems = {
    en: [
      { href: "/", label: "Home" },
      { href: "/generate", label: "Voice Generation" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
    ],
    zh: [
      { href: "/", label: "首页" },
      { href: "/generate", label: "语音生成" },
      { href: "/pricing", label: "定价" },
      { href: "/faq", label: "常见问题" },
    ],
  }

  const authLabels = {
    en: {
      login: "Login",
      signup: "Sign Up",
      account: "Account",
      logout: "Logout",
      credits: "Credits",
    },
    zh: {
      login: "登录",
      signup: "注册",
      account: "账户",
      logout: "退出",
      credits: "积分",
    },
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-semibold text-xl">Voicerly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems[language].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "EN" : "中文"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLanguageChange("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange("zh")}>中文</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    {authLabels[language].credits}: {user.credits}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    {authLabels[language].account}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {authLabels[language].logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                  {authLabels[language].login}
                </Button>
                <Button size="sm" onClick={() => router.push("/signup")}>
                  {authLabels[language].signup}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems[language].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center space-x-2 px-2 pt-4 border-t border-border">
                {user ? (
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="text-sm text-muted-foreground">
                      {user.name || user.email} ({authLabels[language].credits}: {user.credits})
                    </div>
                    <Button variant="ghost" size="sm" className="justify-start" onClick={() => router.push("/account")}>
                      {authLabels[language].account}
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start" onClick={handleLogout}>
                      {authLabels[language].logout}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => router.push("/login")}>
                      {authLabels[language].login}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => router.push("/signup")}>
                      {authLabels[language].signup}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
