import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { Providers } from "./providers"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { PlanProvider } from "@/contexts/plan-context"

export const metadata: Metadata = {
  title: "Pera - Personal Discipline Tracker",
  description: "Track your life balance across Health, Social, Mind, Career, and Faith",
  generator: "Pera.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pera",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "icons/icon-192.png",
    apple: "icons/icon-192.png",
  },
}

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <meta name="theme-color" content="#000000" />
        <SessionProvider>
          <Suspense fallback={null}>
             <PlanProvider>
          {children}
        </PlanProvider>
          </Suspense>
        </SessionProvider>
        <Analytics />

      </body>
    </html>
  )
}
