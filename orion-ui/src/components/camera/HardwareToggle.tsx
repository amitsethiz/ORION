"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { clsx } from "clsx";

interface ToggleButtonProps {
  enabled: boolean;
  onClick: () => void;
  icon: "mic" | "camera";
  label: string;
}

function ToggleButton({ enabled, onClick, icon, label }: ToggleButtonProps) {
  const Icon = enabled
    ? icon === "mic" ? Mic : Camera
    : icon === "mic" ? MicOff : CameraOff;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      title={`${enabled ? "Disable" : "Enable"} ${label}`}
      className={clsx(
        "relative flex flex-col items-center gap-1 rounded border px-3 py-2 transition-all",
        enabled
          ? icon === "mic"
            ? "border-orion-cyan bg-orion-cyan/10 text-orion-cyan shadow-glow-cyan"
            : "border-orion-orange bg-orion-orange/10 text-orion-orange shadow-glow-orange"
          : "border-orion-border text-orion-muted hover:border-orion-border/60"
      )}
    >
      {enabled && (
        <motion.span
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full"
          style={{ background: icon === "mic" ? "#00D4FF" : "#FF6B35" }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <Icon size={15} />
      <span className="text-[8px] tracking-widest">{label}</span>
    </motion.button>
  );
}

interface HardwareToggleProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  onMicToggle: () => void;
  onCameraToggle: () => void;
}

export function HardwareToggle({
  micEnabled,
  cameraEnabled,
  onMicToggle,
  onCameraToggle,
}: HardwareToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <ToggleButton enabled={micEnabled} onClick={onMicToggle} icon="mic" label="MIC" />
      <ToggleButton enabled={cameraEnabled} onClick={onCameraToggle} icon="camera" label="CAM" />
    </div>
  );
}
