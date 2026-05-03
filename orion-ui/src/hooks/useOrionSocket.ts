"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createChatSocket } from "@/lib/api";
import type { StreamEvent, OrbState } from "@/types";

interface UseOrionSocketOptions {
  sessionId: string;
  onToken: (token: string) => void;
  onDone: (tier: number) => void;
  onError: (msg: string) => void;
  onOrbStateChange: (state: OrbState) => void;
}

export function useOrionSocket({
  sessionId,
  onToken,
  onDone,
  onError,
  onOrbStateChange,
}: UseOrionSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = createChatSocket(sessionId);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      clearTimeout(reconnectTimer.current);
    };

    ws.onmessage = (e) => {
      const event: StreamEvent = JSON.parse(e.data);

      switch (event.type) {
        case "tier":
          onOrbStateChange("thinking");
          break;
        case "token":
          onOrbStateChange("speaking");
          if (event.content) onToken(event.content);
          break;
        case "done":
          onOrbStateChange("idle");
          onDone(event.tier ?? 1);
          break;
        case "error":
          onOrbStateChange("error");
          onError(event.message ?? "Unknown error");
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [sessionId, onToken, onDone, onError, onOrbStateChange]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string, history: Array<{ role: string; content: string }>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "message", content, history }));
      }
    },
    []
  );

  return { connected, sendMessage };
}
