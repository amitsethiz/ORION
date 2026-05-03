# O.R.I.O.N.
### Omnipresent Responsive Intelligent Operative Network

> A sci-fi grade, multimodal personal AI assistant with multi-provider LLM routing, voice conversation, camera vision, and persistent memory — built to run locally and deploy anywhere.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORION SYSTEM                             │
│                                                                 │
│  ┌──────────────────────┐     ┌──────────────────────────────┐  │
│  │     orion-ui         │────▶│        orion-api             │  │
│  │  Next.js 14          │ WS  │  FastAPI + WebSockets        │  │
│  │  Tailwind CSS        │◀────│  Python 3.11                 │  │
│  │  Framer Motion       │     │                              │  │
│  │  Three.js (holo FX)  │     │  ┌──────────────────────┐   │  │
│  │  Web Audio API       │     │  │   LiteLLM Router     │   │  │
│  │  Web Speech API      │     │  │   Tier 1 → 2 → 3     │   │  │
│  └──────────────────────┘     │  └──────────────────────┘   │  │
│                               │  ┌──────────────────────┐   │  │
│                               │  │  Voice Pipeline      │   │  │
│                               │  │  STT: faster-whisper │   │  │
│                               │  │  TTS: Coqui TTS      │   │  │
│                               │  └──────────────────────┘   │  │
│                               │  ┌──────────────────────┐   │  │
│                               │  │  Memory (SQLite)     │   │  │
│                               │  │  SQLAlchemy ORM      │   │  │
│                               │  └──────────────────────┘   │  │
│                               └──────────────────────────────┘  │
│                                             │                   │
│              ┌──────────────────────────────▼────────────────┐  │
│              │            LLM Providers                       │  │
│              │  Ollama(local) │ OpenRouter │ OpenAI │         │  │
│              │  Anthropic     │ Google                        │  │
│              └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SSR, routing, WebSocket client |
| Styling | Tailwind CSS | Custom ORION dark theme tokens |
| Animation | Framer Motion | Orb pulse, waveforms, transitions |
| 3D / Holographics | Three.js (react-three-fiber) | Rotating constellation, holographic grids |
| Voice Visualization | Web Audio API + Canvas | Real-time waveform / AI orb |
| STT (browser) | Web Speech API | Free, zero-latency voice input |
| STT (server) | faster-whisper | Local Whisper model, no API cost |
| TTS (browser) | Web Speech Synthesis API | Free built-in browser voices |
| TTS (server) | Coqui TTS | Local neural TTS, no API cost |
| Backend | FastAPI + Python 3.11 | Async API, WebSocket streaming |
| LLM Router | LiteLLM | Unified interface, fallback chains |
| Database | SQLite + SQLAlchemy | Local persistence, cloud-swappable |
| Containerization | Docker + Docker Compose | Single-command local dev stack |

---

## Project Structure

```
ORION/
├── orion-ui/                    # Next.js frontend
│   └── src/
│       ├── components/
│       │   ├── core/            # Layout, ThemeProvider, StatusBar
│       │   ├── chat/            # Message bubbles, streaming text
│       │   ├── voice/           # Orb visualizer, waveform, controls
│       │   ├── camera/          # Camera feed, capture, preview
│       │   └── config/          # Provider config panel, API key forms
│       ├── hooks/               # useWebSocket, useVoice, useCamera
│       ├── lib/                 # API client, WS client, utils
│       ├── styles/              # ORION theme tokens, global CSS
│       └── types/               # TypeScript types
│
├── orion-api/                   # FastAPI backend
│   ├── routers/                 # chat.py, voice.py, vision.py, config.py
│   ├── services/
│   │   ├── llm/                 # LiteLLM router, fallback engine
│   │   ├── voice/               # STT (Whisper), TTS (Coqui) adapters
│   │   ├── vision/              # Camera frame analyzer
│   │   └── memory/              # SQLAlchemy session/message CRUD
│   ├── models/                  # Pydantic schemas + SQLAlchemy models
│   ├── core/                    # Config (Pydantic Settings), app factory
│   └── tests/                   # pytest test suite
│
├── docs/                        # Architecture diagrams, ADRs
├── docker-compose.yml           # Full local stack
├── .env.example                 # Environment template
└── README.md
```

---

## Quick Start (Local)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — for containerized setup
- OR: Node.js 20+ and Python 3.11+ for manual setup

### Option A — Docker (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/amitsethiz/ORION.git
cd ORION

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys and preferences

# 3. Start the full stack
docker-compose up

# 4. (Optional) Start with local Ollama LLM
docker-compose --profile local-llm up
```

Open `http://localhost:3000` — ORION is running.

### Option B — Manual Setup

**Backend:**
```bash
cd orion-api
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd orion-ui
npm install
npm run dev
```

---

## LLM Provider Configuration

ORION uses a **3-tier fallback chain**. Configure in `.env`:

| Tier | Role | Behaviour |
|---|---|---|
| Tier 1 | Primary | Used for all requests by default |
| Tier 2 | First fallback | Auto-switch on rate limit / timeout |
| Tier 3 | Final fallback | Last resort before error |

Supported providers: `ollama` · `openai` · `anthropic` · `google` · `openrouter`

---

## Voice Configuration

| Engine | Cost | Quality | Config |
|---|---|---|---|
| `browser` (STT/TTS) | Free | Good | No setup needed |
| `whisper_local` (STT) | Free | Excellent | Set `STT_ENGINE=whisper_local` |
| `coqui` (TTS) | Free | Very good | Set `TTS_ENGINE=coqui` |
| `elevenlabs` (TTS) | Paid | Best | Set `TTS_ENGINE=elevenlabs` + API key |
| `openai` (TTS/STT) | Paid | Excellent | Set engine + API key |

---

## Camera & Vision

Enable the camera toggle in the ORION interface. While active, ORION can:
- Capture a frame from your live feed on demand
- Send the frame to any vision-capable LLM (GPT-4o, Claude, Gemini)
- Analyze and respond to what it sees in the chat

---

## Roadmap

See the [Jira board](https://amitsethiz.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog) for full sprint plan.

| Sprint | Focus |
|---|---|
| Sprint 1 | Foundation, Backend API, LLM Router |
| Sprint 2 | ORION UI/UX, Voice Pipeline |
| Sprint 3 | Camera Vision, Memory, Deployment |

---

## Contributing

Conventional commit format is enforced:

```
feat(scope): description
fix(scope): description
chore(scope): description
docs(scope): description
```

---

*Built with purpose. Powered by intelligence. O.R.I.O.N.*
