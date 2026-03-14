# Code Structure

## Overview

Food Street Audio Guide is a mobile-first web app for exploring food streets. Users can browse food streets on an interactive map, see vendor pins, and manage streets/vendors via CRUD operations.

---

## Repository Layout

```
food-story/
├── docker-compose.yml          # Orchestrates db + backend + frontend
├── requirements.txt            # Python dependencies for the backend
├── src/
│   ├── backend/
│   │   ├── main.py             # FastAPI app (REST API + PostgreSQL via SQLAlchemy)
│   │   └── Dockerfile          # Backend container (python:3.12-slim + uvicorn)
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.tsx         # Entire React UI (all screens and modals)
│   │   │   ├── main.tsx        # React entry point
│   │   │   └── index.css       # Tailwind CSS import
│   │   ├── index.html          # HTML shell for Vite SPA
│   │   ├── server.ts           # Express dev server (local dev only, not used in Docker)
│   │   ├── vite.config.ts      # Vite config (React + Tailwind plugins, GEMINI_API_KEY env)
│   │   ├── tsconfig.json       # TypeScript config
│   │   ├── package.json        # Node dependencies
│   │   ├── nginx.conf          # nginx config for production container
│   │   └── Dockerfile          # Frontend container (node build → nginx:alpine)
│   ├── static/
│   │   ├── index.html          # Standalone geolocation test page
│   │   └── script.js           # Browser Geolocation API + Web Speech API prototype
│   └── geolocation.py          # Standalone FastAPI app serving static/ (prototype)
└── docs/
    ├── code_structure.md       # This file
    └── archived/               # BRD and SRS documents
```

---

## Services (docker-compose)

| Service    | Image / Build               | Port      | Purpose                          |
|------------|-----------------------------|-----------|----------------------------------|
| `db`       | `postgres:16`               | (internal)| PostgreSQL database               |
| `backend`  | `src/backend/Dockerfile`    | `8000`    | FastAPI REST API                 |
| `frontend` | `src/frontend/Dockerfile`   | `3000`    | nginx serving built React SPA    |

Start all services:
```bash
docker-compose up --build
```

The frontend is available at `http://localhost:3000`. The backend API is available directly at `http://localhost:8000` (also proxied from frontend via nginx at `/api/*`).

---

## Backend (`src/backend/main.py`)

**Runtime:** Python 3.12, FastAPI, SQLAlchemy, psycopg2-binary, Uvicorn

**Database:** PostgreSQL (configured via `DATABASE_URL` env var). Falls back to SQLite when running locally without Docker.

**Tables:**

| Table          | Key Columns                                               |
|----------------|-----------------------------------------------------------|
| `food_streets` | `id`, `name`, `city`, `description`                      |
| `food_vendors` | `id`, `street_id` (FK), `name`, `description`, `rating`, `reviews`, `x`, `y`, `type`, `address`, `images` |

`food_vendors.images` is stored as a JSON string; serialized on write, deserialized on read.

**SQLAlchemy models:** `FoodStreet` ↔ `FoodVendor` with a 1-to-many relationship and `cascade="all, delete-orphan"`.

**REST Endpoints:**

| Method   | Path                                       | Description                    |
|----------|--------------------------------------------|--------------------------------|
| `GET`    | `/streets`                                 | List all streets + vendor count |
| `POST`   | `/streets`                                 | Create a street                |
| `GET`    | `/streets/{id}`                            | Get one street                 |
| `PUT`    | `/streets/{id}`                            | Update a street                |
| `DELETE` | `/streets/{id}`                            | Delete street (cascades vendors) |
| `GET`    | `/streets/{id}/vendors`                    | List vendors for a street      |
| `POST`   | `/streets/{id}/vendors`                    | Add a vendor                   |
| `GET`    | `/streets/{id}/vendors/{vid}`              | Get one vendor                 |
| `PUT`    | `/streets/{id}/vendors/{vid}`              | Update a vendor                |
| `DELETE` | `/streets/{id}/vendors/{vid}`              | Delete a vendor                |

CORS is open (`allow_origins=["*"]`) — restrict in production. `redirect_slashes=False` prevents redirect loops when nginx strips the `/api/` prefix.

---

## Frontend (`src/frontend/`)

**Runtime:** React 19, TypeScript, Vite, Tailwind CSS 4, motion/react, lucide-react

**All UI lives in a single file: `src/App.tsx`**

### Screens

| Screen              | Description                                               |
|---------------------|-----------------------------------------------------------|
| `LocationSelection` | Lists all food streets; supports add, edit, delete        |
| `MapInterface`      | Mock map with vendor pins; tap to place new vendor        |

Screen transitions use `AnimatePresence` from motion/react.

### Modals / Overlays

| Component            | Trigger                                          |
|----------------------|--------------------------------------------------|
| `SettingsModal`      | Settings FAB on map — audio toggle, text size    |
| `VendorBottomSheet`  | Tap a vendor pin — expandable sheet with details |
| `AddLocationModal`   | `+` button on location screen                    |
| `EditLocationModal`  | Edit icon on a street card                       |
| `DeleteLocationModal`| Delete icon on a street card                     |
| `AddVendorModal`     | Tap map in add-vendor mode                       |

### API Calls

All calls use `fetch` against `/api/*`. In Docker, nginx proxies `/api/` → `http://backend:8000/`.

| Action            | Endpoint                              |
|-------------------|---------------------------------------|
| Load streets      | `GET /api/streets`                    |
| Add street        | `POST /api/streets`                   |
| Update street     | `PUT /api/streets/:id`                |
| Delete street     | `DELETE /api/streets/:id`             |
| Load vendors      | `GET /api/streets/:id/vendors`        |
| Add vendor        | `POST /api/streets/:id/vendors`       |

### Local Dev (without Docker)

`server.ts` provides a combined Express + Vite dev server backed by SQLite (`better-sqlite3`). It mirrors the same `/api/*` routes. Run with:

```bash
cd src/frontend
npm install
npm run dev     # runs tsx server.ts → http://localhost:3000
```

---

## nginx Proxy (`src/frontend/nginx.conf`)

```
/api/*  →  http://backend:8000/*   (strips /api prefix)
/*      →  /usr/share/nginx/html   (SPA fallback to index.html)
```

---

## Prototype Components (not part of main Docker setup)

- **`src/geolocation.py`** — Standalone FastAPI app that serves `src/static/` and accepts `POST /location` with GPS coordinates. Used for GPS + TTS prototyping.
- **`src/static/`** — Vanilla JS page demonstrating `navigator.geolocation` and `window.speechSynthesis`.

---

## Environment Variables

| Variable       | Service   | Default                                           | Description           |
|----------------|-----------|---------------------------------------------------|-----------------------|
| `DATABASE_URL` | backend   | `sqlite:///./foodguide.db`                        | PostgreSQL connection string |
| `GEMINI_API_KEY` | frontend | —                                               | Google Gemini API key (future use) |

---

## Key Dependencies

**Python (`requirements.txt`)**
- `fastapi` — web framework
- `uvicorn[standard]` — ASGI server
- `pydantic` — request/response validation
- `sqlalchemy` — ORM
- `psycopg2-binary` — PostgreSQL driver

**Node (`package.json`)**
- `react`, `react-dom` — UI framework
- `vite`, `@vitejs/plugin-react` — build tool
- `@tailwindcss/vite` — CSS utility framework
- `motion` — animations (`motion/react`)
- `lucide-react` — icon library
- `express`, `better-sqlite3`, `tsx` — local dev server only
