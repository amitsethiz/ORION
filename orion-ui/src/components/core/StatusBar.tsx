"use client";

import { motion } from "framer-motion";
import type { OrbState } from "@/types";

interface StatusBarProps {
  connected: boolean;
  orbState: OrbState;
  activeProvider?: string;
  activeModel?: string;
  activeTier?: number;
  messageCount: number;
}

const STATE_COLOR: Record<OrbState, string> = {
  idle:     "text-orion-cyan",
  thinking: "text-purple-400",
  speaking: "text-orion-orange",
  error:    "text-red-400",
};

export function StatusBar({
  connected,
  orbState,
  activeProvider,
  activeModel,
  activeTier,
  messageCount,
}: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between border-t border-orion-border bg-orion-surface/30 px-6 py-1.5">
      {/* Left: connection + orb state */}
      <div className="flex items-center gap-4 text-[9px] tracking-widest">
        <span className="flex items-center gap-1.5">
          <motion.span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-orion-cyan" : "bg-red-400"}`}
            animate={{ opacity: connected ? [1, 0.4, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className={connected ? "text-orion-muted" : "text-red-400"}>
            {connected ? "CONNECTED" : "RECONNECTING"}
          </span>
        </span>

        <span className="text-orion-border">|</span>

        <span className={`flex items-center gap-1.5 ${STATE_COLOR[orbState]}`}>
          <motion.span
            className="h-1 w-1 rounded-full bg-current"
            animate={{ scale: orbState === "thinking" || orbState === "speaking" ? [1, 1.5, 1] : 1 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          {orbState.toUpperCase()}
        </span>
      </div>

      {/* Center: provider info */}
      <div className="flex items-center gap-3 text-[9px] tracking-widest text-orion-muted/60">
        {activeProvider && (
          <>
            <span className="uppercase">{activeProvider}</span>
            <span className="text-orion-border">/</span>
          </>
        )}
        {activeModel && <span className="max-w-[180px] truncate uppercase">{activeModel}</span>}
        {activeTier && (
          <>
            <span className="text-orion-border">·</span>
            <span>TIER {activeTier}</span>
          </>
        )}
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-4 text-[9px] tracking-widest text-orion-muted/60">
        <span>{messageCount} MSG</span>
        <span className="text-orion-border">|</span>
        <span>v0.1.0</span>
        <span className="text-orion-border">|</span>
        <Clock />
      </div>
    </footer>
  );
}

function Clock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time}</span>;
}

import { useState, useEffect } from "react";
