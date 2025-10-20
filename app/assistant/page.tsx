import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ChatInterface } from "@/components/chat-interface"

export default function AssistantPage() {
  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <MobileHeader title="AI Assistant" />

      <main className="flex-1 max-w-lg mx-auto w-full">
        <ChatInterface />
      </main>

      <BottomNav />
    </div>
  )
}
