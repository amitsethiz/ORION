"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CameraOff, ScanLine, Loader2 } from "lucide-react";

interface CameraFeedProps {
  stream: MediaStream | null;
  enabled: boolean;
  onAnalysis?: (analysis: string, imageB64: string) => void;
}

export function CameraFeed({ stream, enabled, onAnalysis }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  async function captureAndAnalyze() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || analyzing) return;

    // Draw current frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const imageB64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    setAnalyzing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vision/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_b64: imageB64,
          mime_type: "image/jpeg",
          prompt: "Analyze this image carefully. Describe what you see and provide any insights or assistance relevant to what is shown.",
        }),
      });
      if (!res.ok) throw new Error("Vision API error");
      const data = await res.json();
      onAnalysis?.(data.analysis, imageB64);
    } catch (err) {
      onAnalysis?.(`[Vision Error] ${err instanceof Error ? err.message : "Unknown error"}`, "");
    } finally {
      setAnalyzing(false);
    }
  }

  if (!enabled) {
    return (
      <div className="flex h-32 w-44 flex-col items-center justify-center gap-2 rounded border border-orion-border bg-orion-void/60">
        <CameraOff size={20} className="text-orion-muted/40" />
        <p className="text-[9px] tracking-widest text-orion-muted/40">CAMERA OFF</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
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
          autoPlay muted playsInline
          className="h-32 w-44 object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* LIVE indicator */}
        <div className="absolute bottom-1.5 left-2 z-10 flex items-center gap-1">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-orion-orange"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[8px] tracking-widest text-orion-orange">LIVE</span>
        </div>

        {/* Analyzing overlay */}
        {analyzing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-orion-void/70">
            <div className="flex flex-col items-center gap-1">
              <Loader2 size={16} className="animate-spin text-orion-cyan" />
              <p className="text-[8px] tracking-widest text-orion-cyan">ANALYZING</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Capture button */}
      <motion.button
        onClick={captureAndAnalyze}
        disabled={analyzing}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center gap-1.5 rounded border border-orion-orange/40 bg-orion-orange/5 py-1 text-[9px] tracking-widest text-orion-orange transition-all hover:bg-orion-orange/10 disabled:opacity-40"
      >
        {analyzing ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <ScanLine size={10} />
        )}
        {analyzing ? "ANALYZING..." : "CAPTURE & ANALYZE"}
      </motion.button>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
