"use client"
   
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFieldErrors({})

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (formData.password !== formData.confirmPassword) {
          setFieldErrors({ confirmPassword: "Passwords do not match" })
          toast.error("Passwords do not match")
          setIsLoading(false)
          passwordInputRef.current?.focus()
          return
        }
        if (formData.password.length < 8) {
          setFieldErrors({ password: "Password must be at least 8 characters" })
          toast.error("Password must be at least 8 characters")
          setIsLoading(false)
          passwordInputRef.current?.focus()
          return
        }
        if (!formData.name.trim()) {
          setFieldErrors({ name: "Name is required" })
          toast.error("Name is required")
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setFieldErrors(data.details || {})
          toast.error(data.error || "Signup failed")
          setIsLoading(false)
          return
        }

        toast.success("Account created! Signing you in...")

        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("🎉 Welcome aboard!", {
              body: "Your AI assistant is setting up your first tasks.",
              icon: "/icons/icon-192x192.png", // optional
            });
          }
        }
        
        // Auto sign in after signup
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          toast.error("Signed up but couldn't sign in. Please try logging in.")
          setIsSignUp(false)
        } else {
          router.push("/home")
          router.refresh()
        }
      } else {
        // Sign In Flow
        if (!formData.email.trim()) {
          setFieldErrors({ email: "Email is required" })
          toast.error("Email is required")
          setIsLoading(false)
          emailInputRef.current?.focus()
          return
        }
        if (!formData.password) {
          setFieldErrors({ password: "Password is required" })
          toast.error("Password is required")
          setIsLoading(false)
          passwordInputRef.current?.focus()
          return
        }

        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setFieldErrors({ password: "Invalid email or password" })
          toast.error("Invalid email or password")
          setIsLoading(false)
          passwordInputRef.current?.focus()
        } else {
          toast.success("Welcome back!")
          router.push("/home")
          router.refresh()
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/home" })
    } catch (error) {
      toast.error("Google sign-in failed")
      console.error("Google sign-in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Pera</h1>
          <p className="text-muted-foreground">Track your life balance across 5 pillars</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Start your discipline journey" : "Continue your journey"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  ref={emailInputRef}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isLoading}
                  ref={passwordInputRef}
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

           
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}