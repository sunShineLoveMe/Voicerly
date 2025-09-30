"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface AuthSwitcherProps {
  children: React.ReactNode
  tabs: {
    value: string
    label: string
    content: React.ReactNode
  }[]
  defaultTab?: string
}

export function AuthSwitcher({ tabs, defaultTab = "otp" }: AuthSwitcherProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const currentTab = searchParams.get("tab") || defaultTab

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
