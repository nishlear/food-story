# External Integrations

**Analysis Date:** 2026-03-18

## APIs & External Services

**Google Gemini AI:**
- **Service**: Google Generative AI API
- **Purpose**: Text generation and AI capabilities
- **SDK/Client**: `@google/genai` 1.29.0
- **Auth**: `GEMINI_API_KEY` environment variable (injected by AI Studio at runtime)
- **Usage**: Available for frontend consumption via Vite config (`vite.config.ts` line 11)

## Data Storage

**Databases:**
- **SQLite** (Development)
  - File-based database: `src/frontend/app.db` (gitignored)
  - Client: `better-sqlite3` 12.4.1 (Node.js native bindings)
  - Used in: `src/frontend/server.ts` (Express dev server)

- **PostgreSQL 16** (Docker/Production)
  - Connection: `postgresql://foodguide:foodguide@db/foodguide_db`
  - ORM: SQLAlchemy (Python)
  - Client: `psycopg2-binary` (FastAPI backend)
  - Used in: `src/backend/main.py` (FastAPI)
  - Volume: Named volume `postgres_data` for persistence

**File Storage:**
- **Image URLs**: Stored as JSON strings in database
- **Static images**: `https://picsum.photos/` for placeholder images (seed data)
- **No cloud storage**: Images are URLs only, not uploaded/stored

**Caching:**
- None detected - no Redis or in-memory caching configured

## Authentication & Identity

**Auth Provider:**
- **Custom Token-Based** (Proof-of-Concept)
- **Implementation**: Base64-encoded `{role}:{username}` tokens
- **Transport**: `X-Role-Token` header on all API requests
- **Token Format**: `base64("{role}:{username}")` (e.g., `YWRtaW46YWRtaW4=`)
- **Hardcoded Users** (PoC only):
  | Username | Password | Role |
  |---|---|---|
  | `user` | `123123` | read-only |
  | `foodvendor` | `123123` | can POST vendors |
  | `admin` | `123123` | full CRUD |

**Backend Auth Endpoints:**
- `POST /api/auth/login` - Login with username/password, returns token
- `POST /api/auth/register` - Register new user (defaults to `user` role)
- `PUT /api/auth/change-password` - Change password (authenticated only)

**Session Management:**
- Tokens stored in React state (`currentUser` in `src/frontend/src/App.tsx`)
- No server-side sessions or JWT signing
- Role-based access control (RBAC) enforced per endpoint

## Monitoring & Observability

**Error Tracking:**
- None detected - no Sentry, Rollbar, or similar

**Logs:**
- **Server logs**: Standard console output (Express and Uvicorn startup messages)
- **No structured logging**: Direct `console.log` or print statements

## CI/CD & Deployment

**Hosting:**
- **Docker Compose** - Local/self-hosted deployment (`docker-compose.yml`)
  - PostgreSQL service: `db` (port not exposed externally)
  - FastAPI backend: `backend` (port 8000)
  - Frontend (Nginx): `frontend` (port 3000)
- **AI Studio Cloud Run** - Mentions in `.env.example` but not actively configured
  - App URL: `APP_URL` env var for self-referential links

**CI Pipeline:**
- None detected - no GitHub Actions, GitLab CI, or similar

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Google Gemini API key (frontend)
- `DATABASE_URL` - PostgreSQL connection string (backend, defaults to SQLite)
- `APP_URL` - Self-hosted app URL (mentioned for Cloud Run)
- `DISABLE_HMR` - Disable Hot Module Replacement (Vite dev server)

**Secrets location:**
- `.env` files (root and `src/frontend/.env`) - **NOT committed to git**
- AI Studio Secrets panel (automatically injected at runtime in Cloud Run)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## API Architecture

**Local Development Path:**
- Express server at `src/frontend/server.ts`
- Vite middleware for HMR
- SQLite database (`better-sqlite3`)
- Runs on port 3000

**Docker Production Path:**
- FastAPI backend (`src/backend/main.py`) on port 8000
- PostgreSQL database
- Nginx frontend proxy on port 3000
- `docker-compose.yml` orchestrates all three services

**API Mirroring:**
Both Express and FastAPI implement identical route surfaces:
- `/api/auth/*` - Authentication
- `/api/streets` - Food street CRUD
- `/api/streets/{id}/vendors` - Vendor CRUD
- `/api/vendors/{id}/comments` - Rating/review system
- `/api/admin/*` - Admin dashboard endpoints

Routes require authentication and enforce role-based access control.

---

*Integration audit: 2026-03-18*
