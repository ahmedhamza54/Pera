"use client"

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState, useRef } from 'react';
import { MobileHeader } from '@/components/mobile-header';
import { BottomNav } from '@/components/bottom-nav';

export default function AssistantPage() {
  const room = 'room-' + Math.random().toString(36).substring(2, 10);
  const name = 'ahmed';
  const [token, setToken] = useState('');
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));
  const [receivedData, setReceivedData] = useState<string[]>([]); // store all received messages

  useEffect(() => {
    let mounted = true;
    const decoder = new TextDecoder();

    // Keep a stable handler reference so we can remove it on cleanup
    const onDataReceived = (payload: ArrayBuffer | Uint8Array | string, participant: any, kind: any) => {
      try {
        let strData = ''
        if (typeof payload === 'string') {
          strData = payload
        } else if (payload instanceof Uint8Array) {
          strData = decoder.decode(payload)
        } else if (payload instanceof ArrayBuffer) {
          strData = decoder.decode(new Uint8Array(payload))
        } else {
          // Fallback: attempt to coerce
          strData = String(payload)
        }

        const identity = participant?.identity ?? 'unknown'
        setReceivedData(prev => [...prev, `${identity}: ${strData}`])
      } catch (err) {
        console.error('Error decoding received data', err)
      }
    }

    (async () => {
      try {
        const resp = await fetch(`/api/get_lk_token?room=${room}&username=${name}`);
        const data = await resp.json();
        if (!mounted) return;

        setToken(data.token);
        if (data.token) {
          const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
          if (!livekitUrl) throw new Error('NEXT_PUBLIC_LIVEKIT_URL is not defined');
          await roomInstance.connect(livekitUrl, data.token);

          // Listen for incoming data (use stable handler so we can remove it)
          roomInstance.on(RoomEvent.DataReceived, onDataReceived);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      try {
        roomInstance.off(RoomEvent.DataReceived, onDataReceived)
      } catch (e) {
        // ignore if off is not available or listener not attached
      }
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  if (token === '') return <div>Getting token...</div>;

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <MobileHeader title="AI Assistant" />
      <RoomContext.Provider value={roomInstance}>
        <div data-lk-theme="default" style={{ height: '100dvh' }}>
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </div>
      </RoomContext.Provider>

      {/* Display received data here */}
      <ReceivedDataPanel
        receivedData={receivedData}
        onSend={async (text: string) => {
          try {
            if (!text) return
            // publish as Uint8Array
            const encoder = new TextEncoder()
            const buf = encoder.encode(text)
            await roomInstance.localParticipant?.publishData?.(buf)
            setReceivedData(prev => [...prev, `you: ${text}`])
          } catch (err) {
            console.error('Failed to send data', err)
          }
        }}
      />

      <BottomNav />
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}

function ReceivedDataPanel({
  receivedData,
  onSend,
}: {
  receivedData: string[]
  onSend: (text: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Autoscroll when new messages arrive
  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [receivedData])

  return (
    <div className="p-4 bg-gray-100">
      <h3 className="font-bold mb-2">Received Data:</h3>
      <div ref={containerRef} className="max-h-40 overflow-auto mb-2 border rounded p-2 bg-white">
        <ul>
          {receivedData.map((msg, idx) => (
            <li key={idx} className="text-sm py-0.5">
              {msg}
            </li>
          ))}
        </ul>
      </div>
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (!text.trim()) return
          await onSend(text.trim())
          setText('')
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 border rounded p-2"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message to send to the room"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  )
}