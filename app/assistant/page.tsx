import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ChatInterface } from "@/components/chat-interface"

export default function AssistantPage() {
  return (
    <div className="flex flex-col h-[90dvh]">
      <MobileHeader title="AI Assistant" />

      <main className="flex-1 max-w-lg mx-auto w-full overflow-hidden">
        <ChatInterface />
      </main>

      <BottomNav />
    </div>
  )
}
