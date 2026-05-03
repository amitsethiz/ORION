"use client";

export default function HomePage() {
  return (
    <main className="holo-grid scan-lines relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-orion-void">
      {/* Corner decorations */}
      <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-orion-cyan opacity-60" />
      <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-orion-cyan opacity-60" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-orion-cyan opacity-60" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-orion-cyan opacity-60" />

      {/* Orb */}
      <div className="relative mb-10 flex items-center justify-center">
        <div className="animate-orb-idle h-32 w-32 rounded-full bg-gradient-to-br from-orion-cyan via-orion-void to-orion-violet shadow-glow-cyan" />
        <div className="absolute h-32 w-32 animate-[orbThink_8s_linear_infinite] rounded-full border border-orion-cyan opacity-20" />
        <div className="absolute h-44 w-44 animate-[orbThink_12s_linear_infinite_reverse] rounded-full border border-orion-cyan opacity-10" />
      </div>

      {/* Title */}
      <h1 className="font-orion text-glow-cyan mb-2 text-4xl tracking-[0.3em] text-orion-cyan">
        O.R.I.O.N.
      </h1>
      <p className="mb-1 text-xs tracking-[0.25em] text-orion-muted">
        OMNIPRESENT RESPONSIVE INTELLIGENT OPERATIVE NETWORK
      </p>
      <p className="mt-6 text-xs text-orion-muted opacity-60">
        SYSTEM INITIALIZING — SPRINT 2 UI INCOMING
      </p>

      {/* Status bar */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 px-8 text-[10px] tracking-widest text-orion-muted">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orion-cyan" />
          API: CONNECTED
        </span>
        <span className="text-orion-border">|</span>
        <span>VERSION 0.1.0</span>
        <span className="text-orion-border">|</span>
        <span>ENV: DEVELOPMENT</span>
      </div>
    </main>
  );
}
