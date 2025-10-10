"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DiagnosticPage() {
  const [diagnostic] = useState({
    objectif: "Improve physical health by running 3 times a week",
    solution: "Create a consistent running plan and track progress",
    problem: "Lack of motivation and inconsistent sleep schedule",
    motivation: "Better energy levels and self-discipline",
  })

  const handleApprove = () => {
    alert("Diagnostic approved and added to your calendar!")
  }

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Diagnostic Table" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {Object.entries(diagnostic).map(([key, value]) => (
          <Card key={key} className="p-4 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="capitalize font-semibold text-accent mb-1">{key}</h2>
            <p className="text-muted-foreground text-sm">{value}</p>
          </Card>
        ))}

        <Button
          onClick={handleApprove}
          className="mt-6 w-full bg-primary text-primary-foreground hover:opacity-90 transition-all"
        >
          Approve & Add to Calendar
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
