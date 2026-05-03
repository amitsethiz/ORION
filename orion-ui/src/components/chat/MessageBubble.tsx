"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types";
import { clsx } from "clsx";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-[9px] font-bold tracking-widest",
          isUser
            ? "border-orion-orange text-orion-orange"
            : "border-orion-cyan text-orion-cyan"
        )}
        style={
          isUser
            ? { boxShadow: "0 0 8px rgba(255,107,53,0.3)" }
            : { boxShadow: "0 0 8px rgba(0,212,255,0.3)" }
        }
      >
        {isUser ? "YOU" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          "relative max-w-[75%] rounded border px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "border-orion-orange/30 bg-orion-orange/5 text-orion-ice"
            : "border-orion-cyan/20 bg-orion-cyan/5 text-orion-ice"
        )}
      >
        {/* Corner accent */}
        <span
          className={clsx(
            "absolute left-0 top-0 h-2 w-2 border-l border-t",
            isUser ? "border-orion-orange/60" : "border-orion-cyan/60"
          )}
        />
        <span
          className={clsx(
            "absolute bottom-0 right-0 h-2 w-2 border-b border-r",
            isUser ? "border-orion-orange/60" : "border-orion-cyan/60"
          )}
        />

        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Streaming cursor */}
        {isStreaming && (
          <motion.span
            className="ml-0.5 inline-block h-3.5 w-0.5 bg-orion-cyan"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}

        {/* Metadata */}
        <div
          className={clsx(
            "mt-1.5 flex items-center gap-2 text-[9px] tracking-wider",
            isUser ? "justify-end text-orion-orange/50" : "text-orion-muted/60"
          )}
        >
          {!isUser && message.provider && (
            <span className="uppercase">{message.provider}</span>
          )}
          {!isUser && message.tier && (
            <span>TIER {message.tier}</span>
          )}
          <span>
            {message.timestamp.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
