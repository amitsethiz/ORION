const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL  = process.env.NEXT_PUBLIC_WS_URL  ?? "ws://localhost:8000";

export async function fetchConfig() {
  const res = await fetch(`${API_URL}/api/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function updateConfig(payload: object) {
  const res = await fetch(`${API_URL}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export function createChatSocket(sessionId: string): WebSocket {
  return new WebSocket(`${WS_URL}/ws/chat/${sessionId}`);
}
