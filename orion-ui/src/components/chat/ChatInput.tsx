"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  micActive: boolean;
  onMicToggle: () => void;
  isListening: boolean;
  transcript: string;
}

export function ChatInput({
  onSend,
  disabled,
  micActive,
  onMicToggle,
  isListening,
  transcript,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-orion-border bg-orion-surface/50 px-4 py-3">
      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-2 flex items-center gap-2 text-[10px] tracking-widest text-orion-cyan"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-orion-cyan"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          LISTENING...
        </motion.div>
      )}

      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="relative flex-1">
          {/* Corner accents */}
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-orion-cyan/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-orion-cyan/40" />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="ENTER COMMAND..."
            rows={1}
            disabled={disabled}
            className={clsx(
              "w-full resize-none rounded border border-orion-border bg-orion-void/80 px-4 py-3",
              "font-mono text-sm text-orion-ice placeholder-orion-muted/40 outline-none",
              "transition-all focus:border-orion-cyan/50",
              "disabled:opacity-40",
              "scrollbar-thin"
            )}
          />
        </div>

        {/* Mic button */}
        <motion.button
          onClick={onMicToggle}
          whileTap={{ scale: 0.93 }}
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-all",
            micActive && isListening
              ? "border-orion-cyan bg-orion-cyan/20 text-orion-cyan shadow-glow-cyan"
              : micActive
              ? "border-orion-cyan/50 text-orion-cyan/70"
              : "border-orion-border text-orion-muted hover:border-orion-cyan/40 hover:text-orion-cyan/60"
          )}
          title={micActive ? "Disable microphone" : "Enable microphone"}
        >
          {isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <Mic size={16} />
            </motion.div>
          ) : micActive ? (
            <Mic size={16} />
          ) : (
            <MicOff size={16} />
          )}
        </motion.button>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          whileTap={{ scale: 0.93 }}
          disabled={disabled || !input.trim()}
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-all",
            input.trim() && !disabled
              ? "border-orion-cyan bg-orion-cyan/10 text-orion-cyan shadow-glow-cyan"
              : "border-orion-border text-orion-muted opacity-40"
          )}
          title="Send message"
        >
          {disabled ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </motion.button>
      </div>

      <p className="mt-1.5 text-right text-[9px] tracking-widest text-orion-muted/40">
        ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
      </p>
    </div>
  );
}
