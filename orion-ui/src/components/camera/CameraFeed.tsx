"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CameraOff } from "lucide-react";

interface CameraFeedProps {
  stream: MediaStream | null;
  enabled: boolean;
}

export function CameraFeed({ stream, enabled }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!enabled) {
    return (
      <div className="flex h-32 w-44 flex-col items-center justify-center gap-2 rounded border border-orion-border bg-orion-void/60">
        <CameraOff size={20} className="text-orion-muted/40" />
        <p className="text-[9px] tracking-widest text-orion-muted/40">CAMERA OFF</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded border border-orion-orange/40"
      style={{ boxShadow: "0 0 16px rgba(255,107,53,0.15)" }}
    >
      {/* Corner accents */}
      <span className="absolute left-0 top-0 z-10 h-3 w-3 border-l-2 border-t-2 border-orion-orange/60" />
      <span className="absolute bottom-0 right-0 z-10 h-3 w-3 border-b-2 border-r-2 border-orion-orange/60" />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-32 w-44 object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Live indicator */}
      <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-orion-orange"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[8px] tracking-widest text-orion-orange">LIVE</span>
      </div>
    </motion.div>
  );
}
