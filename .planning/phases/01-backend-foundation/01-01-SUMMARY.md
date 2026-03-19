---
phase: 01-backend-foundation
plan: 01
subsystem: database
tags: [sqlite, postgresql, sqlalchemy, fastapi, express, staticmap, osm, python]

# Dependency graph
requires: []
provides:
  - Streets table with lat_nw, lon_nw, lat_se, lon_se, map_image_path, map_zoom, map_updated_at columns (SQLite + PostgreSQL)
  - Vendors table with lat and lon columns (SQLite + PostgreSQL)
  - POST/PUT /streets accepts and persists bbox fields in both backends
  - GET /streets returns all bbox and map fields
  - On street save with bbox, PNG map generated from OSM tiles and stored on disk
  - /maps/{id}.png served as static files in both Express and FastAPI
  - src/backend/gen_map.py standalone script for Express subprocess map generation
  - src/backend/map_utils.py reusable generate_map_png function for FastAPI
affects: [02-map-display, 03-vendor-pins]

# Tech tracking
tech-stack:
  added: [staticmap (OSM tile fetching + PNG rendering)]
  patterns: [subprocess map generation from Express, StaticFiles mount in FastAPI, uv-venv python for subprocess]

key-files:
  created:
    - src/backend/gen_map.py
    - src/backend/map_utils.py
  modified:
    - src/frontend/server.ts
    - src/backend/main.py

key-decisions:
  - "Express subprocess calls .venv/bin/python3 (uv-managed venv) not system python3, because staticmap is only installed in the project venv"
  - "map_image_path stores relative path (maps/{id}.png) not absolute, so it works as a URL prefix for both backends"
  - "Map generation is synchronous in both backends — generate PNG before returning API response"

patterns-established:
  - "Migration pattern: one try/catch per ALTER TABLE ADD COLUMN in server.ts, IF NOT EXISTS in main.py"
  - "Static map serving: Express uses express.static at /maps, FastAPI uses StaticFiles mount at /maps"
  - "Map gen invocation: Express spawns gen_map.py subprocess, FastAPI imports map_utils directly"

requirements-completed: [MSET-01, MSET-02]

# Metrics
duration: 4min
completed: 2026-03-19
---

# Phase 1 Plan 01: Backend Foundation — Bbox, Vendor Lat/Lon, Map Generation Summary

**OSM tile-based PNG map generation via staticmap library, bbox schema on streets and lat/lon on vendors, static /maps serving — both Express/SQLite and FastAPI/PostgreSQL backends updated in lockstep.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T11:09:08Z
- **Completed:** 2026-03-19T11:13:08Z
- **Tasks:** 2 (committed as one atomic commit, both tasks complete)
- **Files modified:** 4

## Accomplishments

- Both backends have 7 new street columns (lat_nw, lon_nw, lat_se, lon_se, map_image_path, map_zoom, map_updated_at) and 2 new vendor columns (lat, lon) with non-destructive migrations
- Street create/update endpoints trigger synchronous PNG map generation from OSM tiles when bbox is provided; streets without bbox return null map_image_path with no errors
- Generated PNGs served as static files at /maps/{id}.png in both Express (src/frontend/static/maps/) and FastAPI (src/static/maps/)

## Task Commits

Each task was committed atomically:

1. **Task 1+2: Schema migrations, bbox CRUD, map generation utilities, static serving** - `28f1f22` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `src/backend/map_utils.py` - Reusable generate_map_png function using staticmap library with Mercator tile math and 2048px size cap
- `src/backend/gen_map.py` - Standalone CLI script for Express subprocess, exits 0/1 based on success
- `src/frontend/server.ts` - Added bbox columns in migrations, updated POST/PUT /streets handlers to accept and persist bbox, added /maps static serving and generateMapPng subprocess helper using .venv python
- `src/backend/main.py` - Added bbox columns to FoodStreet model and migrations, lat/lon to FoodVendor, updated Pydantic schemas, list_streets/get_street/create_street/update_street handlers, StaticFiles mount for /maps

## Decisions Made

- Express subprocess uses `.venv/bin/python3` (uv-managed venv) instead of system `python3` because `staticmap` is only installed in the project venv, not system python
- `map_image_path` stores a relative URL-compatible path (`maps/{id}.png`) that works as a frontend URL prefix for both backends
- Map generation is synchronous — PNG is generated before the API response is returned, so the response includes the correct `map_image_path` immediately

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Express subprocess uses uv venv python, not system python3**
- **Found during:** Task 2 verification (gen_map.py standalone test)
- **Issue:** System `python3` lacks `staticmap` module; subprocess would silently fail (generate_map_png returns false, no PNG created)
- **Fix:** Express `generateMapPng` detects and uses `.venv/bin/python3` (uv-managed) if present, falls back to system python3
- **Files modified:** src/frontend/server.ts
- **Verification:** Gen_map standalone test now succeeds via `uv run python3`; server.ts build passes
- **Committed in:** 28f1f22 (combined task commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug, subprocess python path)
**Impact on plan:** Essential fix — without it, map generation would silently fail for all streets in the Express backend. No scope creep.

## Issues Encountered

None beyond the python path issue documented above.

## User Setup Required

None - no external service configuration required. OSM tiles are fetched over public internet (no API key needed).

## Next Phase Readiness

- Phase 2 (map display) can now read `map_image_path` from street objects and render the PNG at `/maps/{id}.png`
- Phase 2 can read vendor `lat`/`lon` coordinates to position pins
- Static map dirs are created on server startup — no manual setup needed
- Note: maps directory for FastAPI is at `src/static/maps/`, for Express at `src/frontend/static/maps/`

---
*Phase: 01-backend-foundation*
*Completed: 2026-03-19*
