"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { StaggeredMenu } from "@/components/staggered-menu"

const menuItems = [
  { label: "Profile", ariaLabel: "Go to profile page", link: "/profile" },
  { label: "About", ariaLabel: "Go to about page", link: "/about" },
  { label: "Log out", ariaLabel: "Log out", link: "/auth" },
]

const socialItems = [
  { label: "Twitter", link: "https://twitter.com/yourhandle" },
  { label: "GitHub", link: "https://github.com/yourhandle" },
  { label: "LinkedIn", link: "https://linkedin.com/in/yourhandle" },
]

export function MobileHeader({ title }: { title: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            accentColor="hsl(var(--primary))"
          />
          <h1 className="text-lg font-semibold text-balance">{title}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}