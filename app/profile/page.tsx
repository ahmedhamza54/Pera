"use client"

import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Bell, Shield, HelpCircle, LogOut, Award, Flame, Target } from "lucide-react"

const settingsSections = [
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", value: "Enabled" },
      { icon: Target, label: "Daily Goals", value: "5 tasks" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Shield, label: "Privacy & Security", value: null },
      { icon: HelpCircle, label: "Help & Support", value: null },
    ],
  },
]

const achievements = [
  { icon: Flame, label: "12 Day Streak", color: "text-chart-4" },
  { icon: Award, label: "100 Tasks Done", color: "text-chart-1" },
  { icon: Target, label: "Perfect Week", color: "text-chart-3" },
]

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Profile" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">John Doe</h2>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="flex-1 justify-center py-2">
              Level 8
            </Badge>
            <Badge variant="secondary" className="flex-1 justify-center py-2">
              342 Points
            </Badge>
          </div>
        </Card>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Achievements</h3>

          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card key={achievement.label} className="p-4 text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${achievement.color}`} />
                  <p className="text-xs text-balance">{achievement.label}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-4">Your Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Tasks Completed</span>
              <span className="text-sm font-semibold">342</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="text-sm font-semibold">12 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Longest Streak</span>
              <span className="text-sm font-semibold">28 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-semibold">Jan 2024</span>
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>

            <Card className="divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-sm text-muted-foreground">{item.value}</span>}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                )
              })}
            </Card>
          </div>
        ))}

        <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
