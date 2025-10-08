"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Bell, Shield, HelpCircle, LogOut, Award, Flame, Target, Trash } from "lucide-react"
import { toast } from "sonner"

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

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      toast.success("Logged out successfully")
      router.push("/auth")
    } catch (error) {
      toast.error("Failed to log out")
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      toast.success("Profile image updated")
      setImagePreview(data.image)
      window.location.reload() // refresh to show new image
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return
    setIsDeleting(true)
    try {
      const res = await fetch("/api/profile", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete account")

      toast.success("Account deleted successfully")
      await signOut({ redirect: false })
      router.push("/auth")
    } catch (error) {
      toast.error("Error deleting account")
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2024"

  const achievements = [
    { icon: Flame, label: `${user.currentStreak || 0} Day Streak`, color: "text-chart-4" },
    { icon: Award, label: `${user.totalTasksCompleted || 0} Tasks Done`, color: "text-chart-1" },
    { icon: Target, label: "Perfect Week", color: "text-chart-3" },
  ]

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Profile" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={imagePreview || user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-1 cursor-pointer text-xs">
                {isUploading ? "..." : "📷"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="flex-1 justify-center py-2">
              Level {user.level || 1}
            </Badge>
            <Badge variant="secondary" className="flex-1 justify-center py-2">
              {user.points || 0} Points
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
              <span className="text-sm font-semibold">{user.totalTasksCompleted || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="text-sm font-semibold">{user.currentStreak || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Longest Streak</span>
              <span className="text-sm font-semibold">{user.longestStreak || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-semibold">{memberSince}</span>
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

        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          <Trash className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Account"}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          size="lg"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoading ? "Logging out..." : "Log Out"}
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}