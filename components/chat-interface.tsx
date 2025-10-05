"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your Pera AI assistant. I can help you track your goals, suggest tasks, and provide insights about your life balance. How can I help you today?",
    timestamp: new Date(),
  },
]

const quickPrompts = [
  "What should I focus on today?",
  "Show my progress this week",
  "Suggest a task for Health",
  "How's my life balance?",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "Based on your recent activity, I recommend focusing on your Social pillar today. You haven't connected with friends in a few days. How about scheduling a call or meeting?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Simulate recording stop after 3 seconds
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        setInput("What should I focus on today?")
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-[85%] p-4 ${
                message.role === "user" ? "bg-accent text-accent-foreground" : "bg-card text-card-foreground"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </Card>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <Card className="max-w-[85%] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground mb-3">Quick prompts</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Badge
                key={prompt}
                variant="secondary"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={isRecording}
          />
          <Button
            onClick={toggleRecording}
            size="icon"
            variant={isRecording ? "default" : "outline"}
            className={isRecording ? "animate-pulse" : ""}
          >
            <Mic className="h-4 w-4" />
            <span className="sr-only">{isRecording ? "Stop recording" : "Start voice input"}</span>
          </Button>
          <Button onClick={handleSend} size="icon" disabled={!input.trim() || isRecording}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Listening...</span>
          </div>
        )}
      </div>
    </div>
  )
}
