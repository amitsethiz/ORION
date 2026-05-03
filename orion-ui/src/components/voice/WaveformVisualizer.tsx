"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  stream: MediaStream | null;
  active: boolean;
  color?: string;
  barCount?: number;
  height?: number;
  width?: number;
}

export function WaveformVisualizer({
  stream,
  active,
  color = "#00D4FF",
  barCount = 32,
  height = 48,
  width = 200,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!active || !stream) {
      cancelAnimationFrame(rafRef.current);
      drawIdle();
      return;
    }

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = barCount * 2;
    ctx.createMediaStreamSource(stream).connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      analyser.getByteFrequencyData(data);
      renderBars(data);
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ctx.close();
    };
  }, [stream, active, barCount]);

  function renderBars(data: Uint8Array) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d")!;
    c.clearRect(0, 0, width, height);

    const barW = (width / barCount) - 1;
    data.forEach((val, i) => {
      const barH = Math.max(2, (val / 255) * height);
      const x = i * (barW + 1);
      const alpha = 0.4 + (val / 255) * 0.6;
      c.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      c.fillRect(x, height - barH, barW, barH);
    });
  }

  function drawIdle() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d")!;
    c.clearRect(0, 0, width, height);
    const barW = (width / barCount) - 1;
    for (let i = 0; i < barCount; i++) {
      const barH = 2 + Math.sin(i * 0.4) * 2;
      c.fillStyle = color + "40";
      c.fillRect(i * (barW + 1), height - barH, barW, barH);
    }
  }

  useEffect(() => { drawIdle(); }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={width} height={height} className="opacity-90" />
      <p className="font-orion text-[9px] tracking-widest text-orion-muted">
        {active ? "MIC ACTIVE" : "MIC OFF"}
      </p>
    </div>
  );
}
