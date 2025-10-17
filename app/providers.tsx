"use client"

import { SessionProvider } from "next-auth/react"
import { PlanProvider } from "@/contexts/plan-context"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <SessionProvider>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </SessionProvider>
    </PlanProvider>
  )
}