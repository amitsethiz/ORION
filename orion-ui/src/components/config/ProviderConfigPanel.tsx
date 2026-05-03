"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { fetchConfig, updateConfig } from "@/lib/api";
import type { AppConfig } from "@/types";

const PROVIDERS = ["ollama", "openai", "anthropic", "google", "openrouter"] as const;
const TTS_ENGINES = ["browser", "coqui", "elevenlabs", "openai"] as const;

interface TierFieldsProps {
  tier: 1 | 2 | 3;
  data: { provider: string; model: string; base_url?: string; has_key: boolean };
  onChange: (tier: 1 | 2 | 3, field: string, value: string) => void;
}

function TierFields({ tier, data, onChange }: TierFieldsProps) {
  const [showKey, setShowKey] = useState(false);
  const colors = tier === 1 ? "border-orion-cyan/40" : tier === 2 ? "border-orion-orange/30" : "border-orion-violet/30";
  const labels = ["PRIMARY", "FALLBACK 1", "FALLBACK 2"];

  return (
    <div className={`rounded border ${colors} p-3`}>
      <p className={`mb-2 text-[9px] tracking-[0.25em] ${tier === 1 ? "text-orion-cyan" : tier === 2 ? "text-orion-orange" : "text-purple-400"}`}>
        TIER {tier} — {labels[tier - 1]}
      </p>

      <div className="flex flex-col gap-2">
        {/* Provider */}
        <div className="relative">
          <select
            value={data.provider}
            onChange={(e) => onChange(tier, "provider", e.target.value)}
            className="w-full appearance-none rounded border border-orion-border bg-orion-void px-3 py-1.5 text-[11px] text-orion-ice outline-none focus:border-orion-cyan/50"
          >
            {PROVIDERS.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
          <ChevronDown size={10} className="pointer-events-none absolute right-2 top-2.5 text-orion-muted" />
        </div>

        {/* Model */}
        <input
          type="text"
          placeholder="MODEL NAME"
          value={data.model}
          onChange={(e) => onChange(tier, "model", e.target.value)}
          className="rounded border border-orion-border bg-orion-void px-3 py-1.5 text-[11px] placeholder-orion-muted/40 text-orion-ice outline-none focus:border-orion-cyan/50"
        />

        {/* Base URL (Ollama only) */}
        {data.provider === "ollama" && (
          <input
            type="text"
            placeholder="http://localhost:11434"
            value={data.base_url ?? ""}
            onChange={(e) => onChange(tier, "base_url", e.target.value)}
            className="rounded border border-orion-border bg-orion-void px-3 py-1.5 text-[11px] placeholder-orion-muted/40 text-orion-ice outline-none focus:border-orion-cyan/50"
          />
        )}

        {/* API Key */}
        {data.provider !== "ollama" && (
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              placeholder={data.has_key ? "KEY SAVED (CLICK TO REPLACE)" : "API KEY"}
              onChange={(e) => onChange(tier, "api_key", e.target.value)}
              className="w-full rounded border border-orion-border bg-orion-void px-3 py-1.5 text-[11px] placeholder-orion-muted/40 text-orion-ice outline-none focus:border-orion-cyan/50"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1.5 text-[9px] text-orion-muted hover:text-orion-cyan"
            >
              {showKey ? "HIDE" : "SHOW"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProviderConfigPanel() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && !config) {
      fetchConfig().then(setConfig).catch(console.error);
    }
  }, [open, config]);

  function handleChange(tier: 1 | 2 | 3, field: string, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [`tier${tier}`]: { ...(prev[`tier${tier}`] ?? {}), [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [key, fields] of Object.entries(overrides)) {
        if (Object.keys(fields).length > 0) payload[key] = fields;
      }
      await updateConfig(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setOverrides({});
      const fresh = await fetchConfig();
      setConfig(fresh);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.93 }}
        className="flex items-center gap-1.5 rounded border border-orion-border px-3 py-2 text-[10px] tracking-widest text-orion-muted transition-all hover:border-orion-cyan/40 hover:text-orion-cyan"
      >
        <Settings size={13} />
        CONFIG
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-orion-void/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-orion-border bg-orion-surface"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-orion-border px-4 py-3">
                <div>
                  <p className="font-orion text-xs tracking-[0.25em] text-orion-cyan">PROVIDER CONFIG</p>
                  <p className="text-[9px] text-orion-muted">LLM ROUTING & ENGINES</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-orion-muted hover:text-orion-ice">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {config ? (
                  <div className="flex flex-col gap-3">
                    <TierFields tier={1} data={{ ...config.tier1, ...overrides.tier1 }} onChange={handleChange} />
                    <TierFields tier={2} data={{ ...config.tier2, ...overrides.tier2 }} onChange={handleChange} />
                    <TierFields tier={3} data={{ ...config.tier3, ...overrides.tier3 }} onChange={handleChange} />

                    {/* TTS Engine */}
                    <div className="rounded border border-orion-border p-3">
                      <p className="mb-2 text-[9px] tracking-[0.25em] text-orion-muted">TTS ENGINE</p>
                      <select
                        value={overrides.tts_engine ?? config.tts_engine}
                        onChange={(e) => setOverrides((p) => ({ ...p, tts_engine: e.target.value }))}
                        className="w-full appearance-none rounded border border-orion-border bg-orion-void px-3 py-1.5 text-[11px] text-orion-ice outline-none focus:border-orion-cyan/50"
                      >
                        {TTS_ENGINES.map((e) => <option key={e} value={e}>{e.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10 text-[10px] text-orion-muted">
                    LOADING CONFIG...
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-orion-border p-4">
                <button
                  onClick={handleSave}
                  disabled={saving || Object.keys(overrides).length === 0}
                  className={clsx(
                    "w-full rounded border py-2 text-[10px] tracking-widest transition-all",
                    saved
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-orion-cyan/40 bg-orion-cyan/10 text-orion-cyan hover:bg-orion-cyan/20",
                    "disabled:opacity-40"
                  )}
                >
                  {saving ? "SAVING..." : saved ? "SAVED" : "APPLY CHANGES"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
