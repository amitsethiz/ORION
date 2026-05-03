# O.R.I.O.N. — Cloud Deployment Guide

## Prerequisites
- Docker + Docker Compose installed
- `.env` file configured (copy from `.env.example`)
- At least one LLM provider API key set in `.env`

---

## Option A — Local Production Stack

```bash
git clone https://github.com/amitsethiz/ORION.git
cd ORION
cp .env.example .env
# Edit .env with your API keys

docker-compose -f docker-compose.prod.yml up --build -d
```

Visit `http://localhost:3000`

---

## Option B — Railway (recommended for quick cloud deploy)

### Backend (orion-api)
1. Create a new Railway project at `railway.app`
2. **New Service → GitHub Repo → ORION**
3. Set root directory to `orion-api`
4. Railway auto-detects the Dockerfile
5. Add environment variables (copy from `.env.example`):
   - All `LLM_TIER*` vars
   - `APP_ENV=production`
   - `DATABASE_URL=sqlite+aiosqlite:////data/orion_memory.db`
   - `FRONTEND_URL=https://your-orion-ui.up.railway.app`
6. Add a **Volume** mounted at `/app/data` for SQLite persistence
7. Railway assigns a public URL — note it as `ORION_API_URL`

### Frontend (orion-ui)
1. **New Service → GitHub Repo → ORION**
2. Set root directory to `orion-ui`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-orion-api.up.railway.app`
   - `NEXT_PUBLIC_WS_URL=wss://your-orion-api.up.railway.app`
4. Deploy — Railway builds from `orion-ui/Dockerfile`

---

## Option C — Vercel (frontend) + Railway (backend)

### Backend on Railway
Follow Option B backend steps above.

### Frontend on Vercel
1. Import the ORION GitHub repo at `vercel.com`
2. Set **Root Directory** to `orion-ui`
3. Framework: **Next.js** (auto-detected)
4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-api.railway.app
   ```
5. Deploy

> **Note:** Vercel does not support WebSockets on serverless functions.
> The frontend connects to the Railway backend WebSocket directly — this works fine.

---

## Option D — Generic VPS (Ubuntu/Debian)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone and configure
git clone https://github.com/amitsethiz/ORION.git
cd ORION
cp .env.example .env
nano .env   # fill in API keys

# 3. Build and start
docker-compose -f docker-compose.prod.yml up --build -d

# 4. (Optional) NGINX reverse proxy for domain + HTTPS
# Install certbot and configure NGINX to proxy:
#   port 3000 -> yourdomain.com
#   port 8000 -> api.yourdomain.com
#   wss://api.yourdomain.com -> orion-api:8000
```

---

## Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `LLM_TIER1_PROVIDER` | Yes | `ollama` \| `openai` \| `anthropic` \| `google` \| `openrouter` |
| `LLM_TIER1_MODEL` | Yes | Model name for tier 1 |
| `LLM_TIER1_API_KEY` | If cloud | API key for tier 1 provider |
| `LLM_TIER2_API_KEY` | Recommended | Fallback provider key |
| `LLM_TIER3_API_KEY` | Recommended | Final fallback key |
| `SECRET_KEY` | Yes | 32-char random string for session security |
| `DATABASE_URL` | Yes | SQLite path or future Postgres URL |
| `FRONTEND_URL` | Yes | Full URL of the deployed frontend |

---

## Upgrading Memory to Postgres (future)

When you outgrow SQLite, swap the driver in `.env`:

```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/orion
```

Then `pip install asyncpg` and re-deploy.
The repository pattern in `services/memory/repository.py` requires no code changes —
the same `ISessionRepository` and `IMessageRepository` interfaces work with any SQLAlchemy-compatible database.
