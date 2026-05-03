export type OrbState = "idle" | "thinking" | "speaking" | "error";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  tier?: number;
  provider?: string;
}

export type StreamEventType = "tier" | "token" | "fallback" | "done" | "error" | "pong";

export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  tier?: number;
  model?: string;
  provider?: string;
  from_tier?: number;
  reason?: string;
  message?: string;
}

export interface ProviderTier {
  provider: string;
  model: string;
  base_url?: string;
  has_key: boolean;
}

export interface AppConfig {
  tier1: ProviderTier;
  tier2: ProviderTier;
  tier3: ProviderTier;
  tts_engine: string;
  stt_engine: string;
}

export interface HardwareState {
  micEnabled: boolean;
  cameraEnabled: boolean;
  micStream: MediaStream | null;
  cameraStream: MediaStream | null;
}
