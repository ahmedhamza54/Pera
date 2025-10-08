"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, LayoutDashboard, Calendar, MessageSquare, User, ClipboardList } from "lucide-react"
import Dock, { type DockItemData } from "@/components/dock"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems: DockItemData[] = [
    { 
      href: "/home", 
      icon: <Home className="h-5 w-5" />, 
      label: "Home",
      onClick: () => router.push("/home")
    },
    { 
      href: "/dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Dashboard",
      onClick: () => router.push("/dashboard")
    },
    { 
      href: "/assistant", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Assistant",
      onClick: () => router.push("/assistant")
    },
    { 
      href: "/diagnostic", 
      icon: <ClipboardList className="h-5 w-5" />, 
      label: "Diagnostic",
      onClick: () => router.push("/diagnostic")
    },
    { 
      href: "/calendar", 
      icon: <Calendar className="h-5 w-5" />, 
      label: "Calendar",
      onClick: () => router.push("/calendar")
    },
  ]

  // Add active state styling by adding className to active item
  const itemsWithActiveState = navItems.map(item => ({
    ...item,
    className: pathname === item.href ? "ring-2 ring-primary" : ""
  }))

  return (
    <Dock 
      items={itemsWithActiveState}
      magnification={60}
      distance={150}
      panelHeight={64}
      baseItemSize={44}
    />
  )
}