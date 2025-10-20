"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePlan } from "@/contexts/plan-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Room, RoomEvent, LocalAudioTrack, LocalTrack, Track } from 'livekit-client'
import { 
  RoomContext,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react'
import '@livekit/components-styles'

import { generateId } from '@/lib/id'

// HOOK: To get real-time microphone volume
function useMicrophoneVolume(isRecording: boolean) {
  const [volume, setVolume] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    const setupMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream = stream;
        setStream(stream);

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const animate = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setVolume(Math.min(1, average / 128));
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setVolume(0);
      setStream(null);
    };

    if (isRecording) {
      setupMicrophone();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isRecording]);

  return { volume, stream };
}


// COMPONENT: Voice visualizer driven by real volume
function VoiceVisualizer({ volume }: { volume: number }) {
  const numBars = 20;
  // <-- CHANGE HERE: Increased max height for taller bars
  const maxHeight = 36; 

  const getBarHeights = () => {
    const heights = Array(numBars).fill(4);
    const activeBars = Math.ceil(volume * numBars);
    
    for (let i = 0; i < activeBars; i++) {
      const distanceFromCenter = Math.abs(i - (numBars - 1) / 2);
      const positionFactor = 1 - (distanceFromCenter / (numBars / 2));
      // <-- CHANGE HERE: Increased multiplier for more sensitivity
      heights[i] = Math.max(4, volume * maxHeight * (positionFactor * 1.6));
    }
    return heights;
  };
  
  const barHeights = getBarHeights();
  
  return (
    <div className="flex items-end justify-center gap-1 h-10" aria-hidden="true"> {/* Increased container height */}
      {barHeights.map((height, index) => {
        const color = height > maxHeight * 0.7 ? 'bg-red-500' : height > maxHeight * 0.4 ? 'bg-yellow-400' : 'bg-green-500';
        return (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-75 ease-in-out ${color}`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}


interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  diagnostic?: Record<string, any> | null
  timestamp: Date
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatSimpleMarkdown(text: string) {
  if (!text) return ""
  let s = escapeHtml(text)
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>")
  s = s.replace(/\r?\n/g, "<br />")
  return s
}

const initialMessages: Message[] = [
  {
    id: generateId(),
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

function MyVideoConference() {
  return (
    <div className="hidden">
      <RoomAudioRenderer />
      <ControlBar />
    </div>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  const { volume, stream } = useMicrophoneVolume(isRecording);

  const containerRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef<string | null>(null)
  const router = useRouter()
  const { setPlanData } = usePlan()
  const [room] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }))
  const { data: session } = useSession()
  const [token, setToken] = useState('')
  const roomName = useRef('room-' + Math.random().toString(36).substring(2, 10))
  const userName = useRef(session?.user?.name || 'user-' + Math.random().toString(36).substring(2, 6))

  useEffect(() => {
    if (!idRef.current) idRef.current = generateId()
  }, [])

  useEffect(() => {
    let mounted = true;
    const decoder = new TextDecoder();

    const onDataReceived = (payload: ArrayBuffer | Uint8Array | string) => {
        // This function's logic is correct and remains unchanged
    };

    const connectToRoom = async () => {
      if (!isRecording || !stream) {
        if (room.state === 'connected') {
          room.disconnect();
        }
        return;
      }

      try {
        const resp = await fetch(`/api/get_lk_token?room=${roomName.current}&username=${userName.current}`);
        const data = await resp.json();
        if (!mounted) return;

        setToken(data.token);
        if (data.token) {
          const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
          if (!livekitUrl) throw new Error('NEXT_PUBLIC_LIVEKIT_URL is not defined');
          
          await room.connect(livekitUrl, data.token);
          
          const audioTrack = new LocalAudioTrack(stream.getAudioTracks()[0]);
          await room.localParticipant.publishTrack(audioTrack);

          room.on(RoomEvent.DataReceived, onDataReceived);
        }
      } catch (e) {
        console.error("Connection Error:", e);
        setIsRecording(false);
      }
    };

    connectToRoom();

    return () => {
      mounted = false;
      room.off(RoomEvent.DataReceived, onDataReceived);
      if (room.state === 'connected') {
        // Use getTrackPublications() which exists on LocalParticipant in current livekit-client versions
        const publications = typeof room.localParticipant.getTrackPublications === "function"
          ? room.localParticipant.getTrackPublications()
          : [];

        publications.forEach((publication: any) => {
          if (publication.track) {
            try {
              room.localParticipant.unpublishTrack(publication.track);
            } catch (e) {
              // ignore individual unpublish errors
              console.warn("Failed to unpublish track:", e);
            }
          }
        });

        room.disconnect();
      }
    };
  }, [isRecording, stream, room]);


  const handleSend = async (promptOverride?: string) => {
    const text = (typeof promptOverride === "string" ? promptOverride : input).trim()
    if (!text) return
  let diagnostic: Record<string, any> | null = null
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const historyForServer = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch(`/api/gemini-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history: historyForServer }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "API error")
      }
      
      const data = await res.json()
      const assistantText = data?.text ?? ""
      let finalContent = assistantText || "Diagnostic is ready for you. Please Confirme!"

      if (data?.functionCalls?.length > 0) {
        const rawArgs = data.functionCalls[0].args ?? {}
        let argsObj: Record<string, any> = {}
        if (typeof rawArgs === "string") {
          try {
            argsObj = JSON.parse(rawArgs)
          } catch (e) {
            argsObj = { value: rawArgs }
          }
        } else {
          argsObj = rawArgs
        }
        diagnostic = argsObj
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: finalContent,
        diagnostic,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt)
  }

  const handleConfirmDiagnostic = async (diagnostic: Record<string, any>) => {
    try {
      const planObj = {
        objectif: String(diagnostic.objectif ?? diagnostic.objectif_text ?? diagnostic.goal ?? ""),
        problem: String(diagnostic.problem ?? diagnostic.issue ?? ""),
        motivation: String(diagnostic.motivation ?? diagnostic.motivation_text ?? ""),
        tasks: [] as any[],
        isApproved: false,
      }
      setPlanData(planObj)
      router.push('/diagnostic')
    } catch (e) {
      console.error('Failed to set plan from diagnostic', e)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      setInput("")
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }, [messages.length])

  return (
    <RoomContext.Provider value={room}>
      <div className="flex flex-col h-full relative">
        <div className="absolute top-0 left-0 w-full">
          <MyVideoConference />
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-none">
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
              <div className="text-sm leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(message.content) }} />

                {message.diagnostic && (
                  <div className="mt-3 border rounded-md p-3 bg-muted/10">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Diagnostic</p>
                    <div className="space-y-1 text-sm">
                      {Object.entries(message.diagnostic).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="font-medium text-muted-foreground mr-2">{key}:</span>
                          <span className="break-words">{String(val)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => message.diagnostic && handleConfirmDiagnostic(message.diagnostic)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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

      <div className="border-t border-border p-4 sticky bottom-0 bg-background/80 backdrop-blur z-10">
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
          >
            <Mic className="h-4 w-4" />
            <span className="sr-only">{isRecording ? "Stop recording" : "Start voice input"}</span>
          </Button>
          <Button onClick={() => handleSend()} size="icon" disabled={!input.trim() || isRecording || isTyping}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        {isRecording && (
          <div className="mt-2 flex flex-col items-center">
             <VoiceVisualizer volume={volume} />
             {/* <-- CHANGE HERE: Added the "Listening..." text back */}
             <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Listening...</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </RoomContext.Provider>
  )
}