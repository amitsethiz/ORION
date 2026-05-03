"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { OrbState } from "@/types";

interface OrbVisualizerProps {
  state: OrbState;
  size?: number;
}

const STATE_COLORS: Record<OrbState, { core: string; ring: string; glow: string }> = {
  idle:     { core: "#00D4FF", ring: "#00D4FF40", glow: "rgba(0,212,255,0.3)" },
  thinking: { core: "#7C3AED", ring: "#7C3AED40", glow: "rgba(124,58,237,0.4)" },
  speaking: { core: "#FF6B35", ring: "#FF6B3540", glow: "rgba(255,107,53,0.35)" },
  error:    { core: "#EF4444", ring: "#EF444440", glow: "rgba(239,68,68,0.3)" },
};

const ORB_LABEL: Record<OrbState, string> = {
  idle:     "STANDBY",
  thinking: "PROCESSING",
  speaking: "RESPONDING",
  error:    "ERROR",
};

export function OrbVisualizer({ state, size = 140 }: OrbVisualizerProps) {
  const colors = STATE_COLORS[state];
  const half = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Orb container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

        {/* Outermost pulse ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{ width: size + 32, height: size + 32, borderColor: colors.ring }}
          animate={state === "speaking"
            ? { scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }
            : { scale: [1, 1.04, 1], opacity: [0.2, 0.4, 0.2] }
          }
          transition={{ duration: state === "speaking" ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbit ring 1 */}
        <motion.div
          className="absolute rounded-full border"
          style={{ width: size + 12, height: size + 12, borderColor: colors.core + "60" }}
          animate={{ rotate: 360 }}
          transition={{ duration: state === "thinking" ? 2 : 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbit ring 2 — counter rotation */}
        <motion.div
          className="absolute rounded-full border border-dashed"
          style={{ width: size - 10, height: size - 10, borderColor: colors.core + "30" }}
          animate={{ rotate: -360 }}
          transition={{ duration: state === "thinking" ? 3 : 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Core orb */}
        <motion.div
          className="relative rounded-full"
          style={{
            width: half + 20,
            height: half + 20,
            background: `radial-gradient(circle at 35% 35%, ${colors.core}cc, ${colors.core}40 50%, #050A14 100%)`,
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}80, inset 0 0 20px ${colors.core}20`,
          }}
          animate={
            state === "thinking"
              ? { scale: [1, 1.05, 0.97, 1.05, 1], rotate: [0, 5, -5, 3, 0] }
              : state === "speaking"
              ? { scale: [1, 1.08, 0.96, 1.08, 1] }
              : { scale: [1, 1.03, 1] }
          }
          transition={{
            duration: state === "thinking" ? 1.2 : state === "speaking" ? 0.45 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner glow dot */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 12, height: 12, background: colors.core, boxShadow: `0 0 12px ${colors.core}` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* State label */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-orion text-[10px] tracking-[0.3em]"
        style={{ color: colors.core }}
      >
        {ORB_LABEL[state]}
      </motion.div>
    </div>
  );
}
