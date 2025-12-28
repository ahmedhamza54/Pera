"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const rotatingHighlights = [
  "Focus on one pillar today, feel the shift tomorrow.",
  "Small habits, steady balance, visible progress.",
  "Track your energy, not just your tasks.",
]

const featureCards = [
  {
    title: "Five pillars, one rhythm",
    description: "Keep Health, Social, Mind, Career, and Faith in view with quick check-ins.",
  },
  {
    title: "Daily momentum",
    description: "Turn reflections into streaks and see where your balance is trending.",
  },
  {
    title: "Gentle structure",
    description: "Guided prompts help you stay intentional without over-optimizing.",
  },
]

export default function RootPage() {
  const [activeHighlight, setActiveHighlight] = useState(0)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlight((current) => (current + 1) % rotatingHighlights.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const timeOfDay = useMemo(() => {
    const hour = now.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [now])

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(now)
  }, [now])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-foreground/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

        <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row">
          <section className="flex w-full max-w-xl flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-10 bg-border" />
              Pera
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Balance your life with calm, consistent check-ins.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Pera helps you stay aligned across your five pillars with a clear daily rhythm and
              gentle accountability. No noise, just progress you can feel.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href="/auth">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[160px]">
                <Link href="/auth">I already have an account</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                {timeOfDay}, {formattedDate}
              </span>
              <span className="text-foreground transition-all duration-500">
                {rotatingHighlights[activeHighlight]}
              </span>
            </div>
          </section>

          <section className="w-full max-w-md animate-fade-in">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Your balance, visualized</h2>
                  <p className="text-sm text-muted-foreground">
                    Track focus areas, spot drift early, and celebrate the steady wins.
                  </p>
                </div>
                <div className="space-y-4">
                  {featureCards.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-lg border border-border bg-background px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Current focus: build your first 7-day streak.
                </div>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
