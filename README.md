# Food Story — Street Food Audio Guide

A mobile-first web application for exploring street food. Users browse food streets on an interactive map, discover vendor details with ratings and menus, and listen to GPS-triggered audio narrations about each spot. Built as a seminar project.

**Author:** Tran Dang Khoa

---

## Features

- **Interactive Map** — Real OSM street maps with vendor pins; pinch-to-zoom; falls back to a stylized mock map when no bbox is set
- **GPS Proximity Narration** — Auto-plays vendor descriptions via TTS when walking nearby (haversine-based, adaptive threshold)
- **Text-to-Speech** — Pre-generated Edge TTS `.mp3` files in 7 languages, with Web Speech API fallback
- **Multi-Language UI** — 7 languages (EN, VI, KO, JA, ZH-CN, ZH-TW, ES) with 279 translatable strings; vendor descriptions auto-translated via GPT-4o-mini
- **Role-Based Access** — Three roles: User (read-only), Food Vendor (manage own vendors), Admin (full CRUD)
- **Admin Dashboard** — Real-time analytics with active user tracking, session metrics, growth stats
- **Food Menu System** — Vendors can list menu items with prices and descriptions
- **Ratings & Comments** — Authenticated users can rate and review vendors

## Roles & Accounts

| Username | Password | Permissions |
|---|---|---|
| `user` | `123123` | View streets and vendors |
| `foodvendor` | `123123` | View + manage own vendors |
| `admin` | `123123` | Full CRUD on streets, vendors, users, comments, menu |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, motion (framer-motion), lucide-react, react-zoom-pan-pinch |
| Backend (Docker) | Python 3.12, FastAPI, SQLAlchemy, Pydantic v2, uvicorn |
| Backend (Dev) | Express (Node.js), better-sqlite3, tsx |
| Database | PostgreSQL 16 (Docker) / SQLite (local dev) |
| TTS | edge-tts (Python, 7 voices) + Web Speech API fallback |
| Maps | staticmap (Python, OSM tiles) |
| Translation | OpenAI GPT-4o-mini (auto-translates vendor descriptions) |
| Container | Docker Compose (3 services: db, backend, frontend), nginx |

## Getting Started

### Local Development (Frontend + Express)

```bash
cd src/frontend
npm install
npm run dev     # http://localhost:3000
```

The dev server (`server.ts`) runs Express + Vite HMR with a local SQLite database. No other services needed.

```bash
npm run build   # Production Vite build
npm run lint    # TypeScript type-check (tsc --noEmit)
npm test        # Run vitest suite
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

Starts three services:
1. **db** — PostgreSQL 16
2. **backend** — FastAPI on port 8000
3. **frontend** — nginx on port 3000 serving the React build, proxying `/api/*`, `/maps/*`, `/audio/*` to the backend

> If Docker is unavailable, start [Colima](https://github.com/abiosoft/colima) first: `colima start`

### Python Backend (standalone)

```bash
cd src/backend
uv run uvicorn main:app --reload    # http://localhost:8000
```

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Vietnamese description auto-translation via GPT-4o-mini |
| `DATABASE_URL` | Docker only | PostgreSQL connection (defaults to SQLite locally) |
| `BACKEND_URL` | Docker only | Backend service URL for nginx proxy (`http://backend:8000`) |

## Project Structure

```
food-story/
├── src/
│   ├── frontend/                     # React app + Express dev server
│   │   ├── src/
│   │   │   ├── App.tsx               # Root: auth state, screen routing
│   │   │   ├── types.ts              # Shared TypeScript types
│   │   │   ├── main.tsx              # React entry point
│   │   │   ├── components/           # React components (one per file)
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── MapInterface.tsx  # Main map view
│   │   │   │   ├── AdminScreen.tsx   # Admin panel shell
│   │   │   │   └── ... (18 components)
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useTTS.ts         # TTS engine
│   │   │   │   ├── useGeolocation.ts # Browser GPS
│   │   │   │   ├── useProximityNarration.ts
│   │   │   │   └── useSessionHeartbeat.ts
│   │   │   ├── i18n/                 # Internationalization
│   │   │   │   ├── context.tsx       # LanguageProvider
│   │   │   │   └── translations/     # 7 language files
│   │   │   └── utils/                # Utilities
│   │   │       ├── geoProjection.ts  # lat/lon <-> CSS % projection
│   │   │       ├── haversine.ts      # Distance calculation
│   │   │       └── vendorDescriptions.ts
│   │   ├── server.ts                 # Local dev server (Express + SQLite)
│   │   ├── nginx.conf                # Docker nginx config
│   │   └── package.json
│   ├── backend/                      # FastAPI REST API (Docker)
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config.py                 # Configuration
│   │   ├── database.py               # SQLAlchemy engine
│   │   ├── models.py                 # ORM models (6 tables) + seed_users()
│   │   ├── schemas.py                # Pydantic models
│   │   ├── auth.py                   # Token helpers
│   │   ├── map_utils.py              # OSM static map generation
│   │   ├── audio.py                  # Edge TTS audio generation
│   │   ├── utils.py                  # Translation, rating helpers
│   │   ├── Dockerfile
│   │   └── routers/
│   │       ├── auth.py, streets.py, vendors.py
│   │       ├── comments.py, menu.py, sessions.py
│   │       └── admin.py
│   └── static/                       # Standalone GPS/TTS prototypes
├── docs/
│   ├── sequence-diagrams.md          # 26 Mermaid sequence diagrams
│   ├── activity-diagrams.md
│   ├── usecase-diagrams.md
│   ├── code_structure.md
│   ├── feature-list.md
│   └── TODO.md
├── .planning/                        # Project planning artifacts
├── docker-compose.yml
├── requirements.txt
└── pyproject.toml
```

## API

All endpoints require an `X-Role-Token` header (except `POST /api/auth/login`). The token is `base64(role:username)`.

### Auth
| Method | Path | Role |
|---|---|---|
| `POST` | `/api/auth/login` | — |
| `POST` | `/api/auth/register` | — |
| `PUT` | `/api/auth/change-password` | any authenticated |

### Streets
| Method | Path | Role |
|---|---|---|
| `GET` | `/api/streets` | any |
| `GET` | `/api/streets/:id` | any |
| `POST` | `/api/streets` | admin |
| `PUT` | `/api/streets/:id` | admin |
| `DELETE` | `/api/streets/:id` | admin |

### Vendors
| Method | Path | Role |
|---|---|---|
| `GET` | `/api/streets/:id/vendors` | any |
| `GET` | `/api/streets/:id/vendors/:vid` | any |
| `POST` | `/api/streets/:id/vendors` | admin, foodvendor |
| `PUT` | `/api/streets/:sid/vendors/:vid` | admin, foodvendor (own) |
| `DELETE` | `/api/streets/:sid/vendors/:vid` | admin |
| `GET` | `/api/vendors/mine` | foodvendor |
| `GET` | `/api/vendors/:vid/audio-status` | any |

### Comments & Menu
| Method | Path | Role |
|---|---|---|
| `GET` | `/api/vendors/:vid/comments` | any |
| `POST` | `/api/vendors/:vid/comments` | any authenticated |
| `DELETE` | `/api/vendors/:vid/comments/:cid` | admin |
| `GET` | `/api/vendors/:vid/menu` | any |
| `POST` | `/api/vendors/:vid/menu` | admin, foodvendor |
| `PUT` | `/api/vendors/:vid/menu/:itemId` | admin, foodvendor |
| `DELETE` | `/api/vendors/:vid/menu/:itemId` | admin, foodvendor |

### Sessions
| Method | Path | Role |
|---|---|---|
| `POST` | `/api/sessions/heartbeat` | — |

### Admin
| Method | Path | Role |
|---|---|---|
| `GET` | `/api/admin/stats` | admin |
| `GET` | `/api/admin/users` | admin |
| `PUT` | `/api/admin/users/:uid` | admin |
| `DELETE` | `/api/admin/users/:uid` | admin |
| `GET` | `/api/admin/vendors` | admin |
| `GET` | `/api/admin/comments` | admin |
| `GET` | `/api/admin/analytics` | admin |
| `GET` | `/api/admin/active-users` | admin |
| `GET` | `/api/admin/active-users/:id` | admin |
| `GET` | `/api/admin/menu` | admin |

### Map Images
| Path | Description |
|---|---|
| `GET /maps/{street_id}.png` | OSM static map (generated via `staticmap`) |
| `GET /audio/{vendor_id}_{lang}.mp3` | Pre-generated TTS audio file |

## Key Architecture Notes

- **Two backend implementations mirror the same API surface**: Express + SQLite for local dev, FastAPI + PostgreSQL for Docker. When adding endpoints, update **both** `server.ts` and the FastAPI routers.
- **Role gating** is enforced both client-side (UI visibility) and server-side (HTTP 403).
- **Map images** are auto-generated from OSM tiles via the `staticmap` Python package when a street's bounding box is set.
- **Audio files** are pre-generated via `edge-tts` in 7 languages on vendor creation/update.
- **Vendor descriptions** are stored as JSON keyed by language code; Vietnamese is the source language, auto-translated to 6 others via OpenAI GPT-4o-mini.
- **Guest browsing** is allowed for streets, vendors, and comments (with a login prompt for reviews).
