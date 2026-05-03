"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "@/types";

interface ChatWindowProps {
  messages: ChatMessage[];
  streamingId: string | null;
}

export function ChatWindow({ messages, streamingId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="font-orion text-xs tracking-[0.3em] text-orion-cyan text-glow-cyan">
          O.R.I.O.N. ONLINE
        </p>
        <p className="max-w-xs text-[11px] leading-relaxed text-orion-muted">
          TYPE A MESSAGE OR PRESS THE MIC BUTTON TO BEGIN. I AM READY TO ASSIST.
        </p>
        <div className="mt-2 flex gap-2">
          {["RESEARCH", "ANALYZE", "CREATE", "EXPLAIN"].map((tag) => (
            <span
              key={tag}
              className="rounded border border-orion-border px-2 py-0.5 text-[9px] tracking-widest text-orion-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={streamingId === msg.id}
          />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
