"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email") || ""

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!emailFromUrl) {
      router.push("/auth/forgot-password")
    }
  }, [emailFromUrl, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Invalid OTP")
        setIsLoading(false)
        return
      }

      toast.success("OTP verified!")
      router.push(`/auth/reset-password?email=${encodeURIComponent(emailFromUrl)}&otp=${otp}`)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error("OTP verification error:", error)
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setIsResending(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to resend OTP")
        setIsResending(false)
        return
      }

      toast.success("New OTP sent to your email!")
      setCountdown(60)
      setOtp("")
    } catch (error) {
      toast.error("Failed to resend OTP")
      console.error("Resend OTP error:", error)
    } finally {
      setIsResending(false)
    }
  }

  if (!emailFromUrl) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Verify OTP</h1>
          <p className="text-muted-foreground">
            We sent a 6-digit code to <br />
            <span className="font-medium text-foreground">{emailFromUrl}</span>
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-semibold"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-center">Valid for 10 minutes</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || otp.length !== 6}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
            >
              {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}