# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Local Development (no Docker)
```bash
cd src/frontend
npm install
npm run dev        # Express + Vite dev server at http://localhost:3000
npm run build      # Production Vite build
npm run lint       # TypeScript type-check (tsc --noEmit)
npm test           # Run vitest suite (all tests)
npx vitest run src/frontend/src/utils/geoProjection.test.ts  # Run a single test file
```

### Docker
```bash
docker-compose up --build   # Start db + backend + frontend
# If docker is unavailable, start colima first: colima start
```

### Python Backend (standalone)
```bash
cd src/backend
uv run uvicorn main:app --reload   # Always use uv; activate venv first
```

## Architecture

Two independent deployment paths share the same React frontend build:

**Local dev** — `src/frontend/server.ts` is an Express server that:
- Serves the Vite dev middleware (HMR)
- Implements all `/api/*` routes backed by **SQLite** (`better-sqlite3`)
- Handles auth at `POST /api/auth/login`

**Docker** — `docker-compose.yml` runs three services:
- `db`: PostgreSQL 16
- `backend`: FastAPI (`src/backend/main.py`) on port 8000, backed by PostgreSQL
- `frontend`: nginx (`src/frontend/nginx.conf`) on port 3000, proxies `/api/*` and `/maps/*` → `http://backend:8000/*`

The FastAPI and Express servers mirror the same route surface. When adding endpoints, update **both** `server.ts` and `main.py`.

## Map Feature

Streets optionally have a static PNG map image generated from OSM tiles:

- **Bounding box** — `lat_nw`, `lon_nw`, `lat_se`, `lon_se` on a street record define the map area. Setting these triggers automatic map generation via `src/backend/map_utils.py` (uses the `staticmap` Python package).
- **Map storage** — PNGs saved to `src/static/maps/{street_id}.png`, served at `/maps/{street_id}.png`. The `maps_data` Docker volume persists these across restarts.
- **Frontend** — `MapInterface.tsx` renders the map when `location.map_image_path` is set. Falls back to the mock map UI when no image exists.
- **Geo-projection** — `src/frontend/src/utils/geoProjection.ts` exports `projectVendorToPercent` (lat/lon → CSS %) and `percentToLatLon` (CSS % → lat/lon). Both use linear bbox mapping valid at food-street scale.
- **Admin pin placement** — Admins open a vendor's edit modal → "Set Location on Map" → tap map → confirm to save lat/lon on the vendor.

## Auth System (PoC)

Token = `base64(role:username)` sent as `X-Role-Token` header on every API request.

Hardcoded accounts:
| Username | Password | Role |
|---|---|---|
| `user` | `123123` | read-only |
| `foodvendor` | `123123` | can POST vendors |
| `admin` | `123123` | full CRUD |

Login flow: `POST /api/auth/login` → `{ username, role, token }` → stored in React state (`currentUser`).

Role guards:
- GET routes: any authenticated user (401 if no token)
- `POST/PUT/DELETE /streets`: admin only (403)
- `POST /streets/:id/vendors`: admin or foodvendor (403)

## Frontend Structure

All React UI lives under `src/frontend/src/`:
- `App.tsx` — root state, auth handlers, screen routing (`login` → `location` → `map` → `admin`)
- `types.ts` — `UserRole`, `CurrentUser` types
- `utils/geoProjection.ts` — coordinate projection utilities (tested)
- `components/` — one file per component

Screen transitions use `AnimatePresence` from `motion/react`. The `key` prop on screens drives exit/enter animations.

Role-based UI gating is done by checking `currentUser.role` directly in components — no context or global store. Admin-only UI (edit/delete buttons on streets, "Set Location on Map" in vendor edit modal) checks `currentUser.role === 'admin'`.

## Key Constraints

- `npm run lint` (`tsc --noEmit`) will report false-positive `key` prop errors on components due to a React 19 TypeScript types change. The Vite build (`npm run build`) succeeds and is the authoritative build check.
- `server.ts` is for local dev only — it is not used in the Docker deployment.
- Backend SQLite DB file is `src/frontend/app.db` (gitignored); Docker uses a named postgres volume.
- `src/static/` and `src/geolocation.py` are standalone GPS/TTS prototypes, not part of the main app.
- The `staticmap` Python package must be in `requirements.txt` for map generation to work in Docker.
