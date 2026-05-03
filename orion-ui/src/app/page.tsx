"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";

import { OrbVisualizer } from "@/components/voice/OrbVisualizer";
import { WaveformVisualizer } from "@/components/voice/WaveformVisualizer";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { StatusBar } from "@/components/core/StatusBar";
import { HardwareToggle } from "@/components/camera/HardwareToggle";
import { CameraFeed } from "@/components/camera/CameraFeed";
import { ProviderConfigPanel } from "@/components/config/ProviderConfigPanel";

import { useOrionSocket } from "@/hooks/useOrionSocket";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceSynthesis } from "@/hooks/useVoiceSynthesis";
import { useHardware } from "@/hooks/useHardware";

import type { ChatMessage, OrbState } from "@/types";

const SESSION_ID = uuidv4();

export default function OrionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [activeProvider, setActiveProvider] = useState<string>();
  const [activeModel, setActiveModel] = useState<string>();
  const [activeTier, setActiveTier] = useState<number>();

  const hardware = useHardware();
  const streamBuffer = useRef("");
  const currentMsgId = useRef<string | null>(null);

  const { speak } = useVoiceSynthesis({
    onSpeakStart: () => setOrbState("speaking"),
    onSpeakEnd: () => setOrbState("idle"),
  });

  const { isListening, interimTranscript, toggleListening } = useVoiceInput({
    onFinalTranscript: (text) => sendMessage(text),
  });

  const handleToken = useCallback((token: string) => {
    streamBuffer.current += token;
    if (!currentMsgId.current) return;
    const id = currentMsgId.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: streamBuffer.current } : m))
    );
  }, []);

  const handleDone = useCallback((tier: number) => {
    setOrbState("idle");
    setStreamingId(null);
    speak(streamBuffer.current);
    streamBuffer.current = "";
    currentMsgId.current = null;
  }, [speak]);

  const handleError = useCallback((msg: string) => {
    setOrbState("error");
    setStreamingId(null);
    const errMsg: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `[ERROR] ${msg}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errMsg]);
    currentMsgId.current = null;
    streamBuffer.current = "";
  }, []);

  const handleOrbState = useCallback((s: OrbState) => {
    setOrbState(s);
  }, []);

  const { connected, sendMessage: wsSend } = useOrionSocket({
    sessionId: SESSION_ID,
    onToken: handleToken,
    onDone: handleDone,
    onError: handleError,
    onOrbStateChange: handleOrbState,
  });

  function sendMessage(content: string) {
    if (!content.trim() || !connected) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const assistantId = uuidv4();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreamingId(assistantId);
    currentMsgId.current = assistantId;
    streamBuffer.current = "";
    setOrbState("thinking");

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    wsSend(content, history);
  }

  return (
    <div className="holo-grid scan-lines relative flex h-screen flex-col overflow-hidden bg-orion-void">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-orion-border px-6 py-2.5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-7 w-7 rounded-sm border border-orion-cyan bg-orion-cyan/10"
            style={{ boxShadow: "0 0 10px rgba(0,212,255,0.3)" }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-orion text-[10px] font-bold text-orion-cyan">O</span>
            </div>
          </div>
          <div>
            <p className="font-orion text-xs tracking-[0.3em] text-orion-cyan text-glow-cyan">
              O.R.I.O.N.
            </p>
            <p className="text-[8px] tracking-[0.15em] text-orion-muted/60">
              OMNIPRESENT RESPONSIVE INTELLIGENT OPERATIVE NETWORK
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <HardwareToggle
            micEnabled={hardware.micEnabled}
            cameraEnabled={hardware.cameraEnabled}
            onMicToggle={hardware.toggleMic}
            onCameraToggle={hardware.toggleCamera}
          />
          <div className="h-5 w-px bg-orion-border" />
          <ProviderConfigPanel />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left panel */}
        <aside className="flex w-56 shrink-0 flex-col items-center gap-5 border-r border-orion-border px-4 py-6">
          <OrbVisualizer state={orbState} size={120} />
          <WaveformVisualizer
            stream={hardware.micStream}
            active={hardware.micEnabled}
            width={160}
            height={40}
          />

          {/* Camera feed */}
          <CameraFeed
            stream={hardware.cameraStream}
            enabled={hardware.cameraEnabled}
            onAnalysis={(analysis) => {
              if (!analysis) return;
              const visionMsg: ChatMessage = {
                id: uuidv4(),
                role: "assistant",
                content: `[VISION ANALYSIS]\n\n${analysis}`,
                timestamp: new Date(),
                provider: "vision",
              };
              setMessages((prev) => [...prev, visionMsg]);
            }}
          />

          {/* Session info */}
          <div className="mt-auto w-full rounded border border-orion-border/50 p-2">
            <p className="mb-1 text-[8px] tracking-widest text-orion-muted/50">SESSION</p>
            <p className="truncate font-mono text-[9px] text-orion-muted/70">
              {SESSION_ID.slice(0, 18)}...
            </p>
            <p className="mt-1 text-[8px] text-orion-muted/50">
              {messages.filter((m) => m.role === "user").length} exchanges
            </p>
          </div>
        </aside>

        {/* Chat area */}
        <section className="flex flex-1 flex-col overflow-hidden">
          <ChatWindow messages={messages} streamingId={streamingId} />
          <ChatInput
            onSend={sendMessage}
            disabled={streamingId !== null}
            micActive={hardware.micEnabled}
            onMicToggle={toggleListening}
            isListening={isListening}
            transcript={interimTranscript}
          />
        </section>
      </main>

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <StatusBar
        connected={connected}
        orbState={orbState}
        activeProvider={activeProvider}
        activeModel={activeModel}
        activeTier={activeTier}
        messageCount={messages.length}
      />

      {/* Corner frame decorations */}
      <div className="pointer-events-none absolute left-0 top-0 h-12 w-12 border-l-2 border-t-2 border-orion-cyan/20" />
      <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r-2 border-t-2 border-orion-cyan/20" />
    </div>
  );
}
