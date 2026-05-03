"use client";

import { useState, useCallback, useRef } from "react";

export interface HardwareState {
  micEnabled: boolean;
  cameraEnabled: boolean;
  micStream: MediaStream | null;
  cameraStream: MediaStream | null;
  micError: string | null;
  cameraError: string | null;
}

export function useHardware() {
  const [state, setState] = useState<HardwareState>({
    micEnabled: false,
    cameraEnabled: false,
    micStream: null,
    cameraStream: null,
    micError: null,
    cameraError: null,
  });

  const toggleMic = useCallback(async () => {
    if (state.micEnabled && state.micStream) {
      state.micStream.getTracks().forEach((t) => t.stop());
      setState((s) => ({ ...s, micEnabled: false, micStream: null, micError: null }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setState((s) => ({ ...s, micEnabled: true, micStream: stream, micError: null }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setState((s) => ({ ...s, micEnabled: false, micStream: null, micError: msg }));
    }
  }, [state.micEnabled, state.micStream]);

  const toggleCamera = useCallback(async () => {
    if (state.cameraEnabled && state.cameraStream) {
      state.cameraStream.getTracks().forEach((t) => t.stop());
      setState((s) => ({ ...s, cameraEnabled: false, cameraStream: null, cameraError: null }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setState((s) => ({ ...s, cameraEnabled: true, cameraStream: stream, cameraError: null }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setState((s) => ({ ...s, cameraEnabled: false, cameraStream: null, cameraError: msg }));
    }
  }, [state.cameraEnabled, state.cameraStream]);

  return { ...state, toggleMic, toggleCamera };
}
