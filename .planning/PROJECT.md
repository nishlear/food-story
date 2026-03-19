# Food Story — Interactive Map Feature

## What This Is

Food Story is a mobile web app for discovering street food vendors. This milestone adds an interactive map layer to each food street: admins define a geographic bounding box (NW + SE lat/lon), the system generates a static map image, and users see the map as their primary view — with vendor pins at their real locations and a live GPS blue dot showing the user's current position.

## Core Value

When a user is physically at a food street, the map shows exactly where they are and where every vendor stall is — making it trivial to navigate the street.

## Requirements

### Validated

- ✓ User can log in with username/password and receive a role-based token — existing
- ✓ User can browse a list of food streets — existing
- ✓ User can select a street and see its vendors — existing
- ✓ Vendor details (name, rating, comments) are shown in a bottom sheet — existing
- ✓ Admin can create, edit, and delete food streets — existing
- ✓ Admin and foodvendor roles can add vendors to a street — existing
- ✓ Admin can manage users and comments via dashboard — existing

### Active

- [ ] Admin can attach a geographic bounding box (NW + SE lat/lon) to a street (new or existing)
- [ ] System generates a static map image for a street's bounding box using OpenStreetMap tiles
- [ ] When a street has a map, the map is the primary view (replaces vendor list as main UI)
- [ ] Map supports zoom and pan gestures
- [ ] Vendor pins appear at their correct geographic positions on the map
- [ ] Admin can place a vendor pin by tapping the map image; position stored as lat/lon
- [ ] Vendor pin positions remain geographically accurate regardless of map zoom/resize
- [ ] User's GPS location appears as a blue dot on the map when within the street's bounding box
- [ ] Blue dot only shows when GPS accuracy is sufficient (< 30 m)
- [ ] Tapping a vendor pin slides up the existing vendor detail bottom sheet
- [ ] Streets without a map attached continue to use the existing vendor list UI

### Out of Scope

- Real-time multi-user location sharing — complexity, privacy concerns
- Turn-by-turn navigation within the street — out of scope for v1
- Custom map tile providers — OSM tiles only for now
- Vendor positions set by vendors themselves — admin-only pin placement for consistency

## Context

**Existing codebase (brownfield):**
- Dual-backend: Express + SQLite for local dev (`server.ts`), FastAPI + PostgreSQL for Docker (`main.py`). All new routes must be added to both.
- React 19 + Tailwind CSS + Framer Motion. Components are one-file-per-component in `src/frontend/src/components/`.
- Auth: `base64(role:username)` token via `X-Role-Token` header. Role-gated APIs already exist.
- Current screen flow: `login → location → map` (MapInterface with vendor bottom sheet)
- Admin dashboard: `AdminDashboard.tsx` with tabs for streets, vendors, users, comments

**Map generation prototype:**
- `src/map.py` — generates static map PNG from bounding box using `staticmap` + OSM tiles at zoom 19
- Bounding box math (Mercator projection) is already implemented there

**GPS prototype:**
- `src/geolocation.py` — FastAPI HTTPS server receiving GPS coordinates
- GPS will use browser `navigator.geolocation.watchPosition()` directly in React (no separate server needed)
- HTTPS required for GPS on mobile — use ngrok for local dev testing

**Key math (from map.py):**
- `lon_to_tile_x`, `lat_to_tile_y` — Mercator projection for pixel mapping
- GPS → pixel and tap → lat/lon both use this math

## Constraints

- **Tech stack**: React + TypeScript frontend, Express (dev) + FastAPI (Docker). No new frameworks.
- **Map library**: `staticmap` (Python) for server-side generation. No client-side tile library.
- **GPS**: Browser Geolocation API only (`watchPosition`). No native app.
- **HTTPS**: Required for GPS on mobile. Local dev needs ngrok or equivalent.
- **Dual backend**: Every new endpoint must be added to both `server.ts` AND `main.py`.
- **Vendor pin storage**: Lat/lon only (not pixel coordinates) — pins must survive map resize.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Map as primary view (not a tab) | When a street has a map, the map IS the street experience | — Pending |
| Store vendor positions as lat/lon | Pixel coords break on resize; lat/lon re-projects at render time | — Pending |
| Server-side map generation (staticmap) | Reuses existing map.py logic; no client tile rendering complexity | — Pending |
| Tap-to-place vendor pins (admin) | More intuitive than manual lat/lon entry | — Pending |
| Blue dot only when within bounding box | Dot outside bounds is meaningless/confusing | — Pending |

---
*Last updated: 2026-03-19 after initialization*
