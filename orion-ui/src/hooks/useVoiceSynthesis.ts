"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceSynthesisOptions {
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useVoiceSynthesis({
  onSpeakStart,
  onSpeakEnd,
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
}: UseVoiceSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const queueRef = useRef<string[]>([]);
  const activeRef = useRef(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      // Prefer a natural English voice
      const preferred = v.find(
        (x) => x.lang.startsWith("en") && (x.name.includes("Google") || x.name.includes("Natural"))
      ) ?? v.find((x) => x.lang.startsWith("en")) ?? v[0] ?? null;
      setSelectedVoice(preferred);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window) || !text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        activeRef.current = true;
        onSpeakStart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        activeRef.current = false;
        onSpeakEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        activeRef.current = false;
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, rate, pitch, volume, onSpeakStart, onSpeakEnd]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    activeRef.current = false;
  }, []);

  return { isSpeaking, supported, voices, selectedVoice, setSelectedVoice, speak, stop };
}
