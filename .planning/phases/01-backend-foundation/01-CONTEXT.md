# Phase 1: Backend Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Store bounding boxes and generate static map PNGs from OSM tiles, serve them to the frontend. Zero visible UI change this phase. Unblocks all Phase 2 map rendering work.

Requirements: MSET-01 (bbox storage), MSET-02 (map generation)

</domain>

<decisions>
## Implementation Decisions

### Map Generation Timing
- Synchronous — server generates PNG before responding to the street save request
- Admin waits ~1–2 seconds; map is immediately available when response returns
- No background jobs, no polling needed

### Map Regeneration Trigger
- Regenerate on every street save that includes bbox coords (simplest approach)
- No diff check against previous bbox — always overwrite

### Image Serving
- Serve as static files at `/maps/{street_id}.png`
- Standard static file serving (cacheable by browser)
- NOT behind an auth-gated API endpoint

### Missing Map Fallback
- If PNG is missing or generation fails: return `null` for `map_image_path` in street API response
- Frontend treats `null` as "no map" → falls back to existing vendor list UI
- No 500 errors for missing images

### Vendor Coordinate Columns
- Add new `lat REAL` and `lon REAL` columns to vendors table (nullable)
- Existing `x` and `y` columns stay untouched — they are CSS percentage positions used by the current MapInterface
- Geographic lat/lon always stored in the new columns, never in x/y

### Schema — Streets Table
- Add to both SQLite (server.ts) and PostgreSQL (main.py):
  - `lat_nw REAL` — NW corner latitude (nullable)
  - `lon_nw REAL` — NW corner longitude (nullable)
  - `lat_se REAL` — SE corner latitude (nullable)
  - `lon_se REAL` — SE corner longitude (nullable)
  - `map_image_path TEXT` — relative path e.g. `maps/1.png` (nullable)
  - `map_zoom INTEGER DEFAULT 19`

### Claude's Discretion
- Express-side map generation approach (Python subprocess vs TypeScript port — planner decides)
- Exact image storage path (`src/frontend/static/maps/` vs `src/static/maps/`)
- Cache-busting strategy for regenerated images

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Backend Code
- `src/frontend/server.ts` — Express dev server; all new routes go here. Migration pattern: `db.exec('ALTER TABLE ... ADD COLUMN ...')` wrapped in try/catch (see line 53–57)
- `src/backend/main.py` — FastAPI prod server; all new routes go here. Migration pattern: `text("ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...")` (see line 87)

### Map Generation
- `src/map.py` — Existing map generation prototype. Bounding box math (lon_to_tile_x, lat_to_tile_y), staticmap usage, zoom 19. Backend endpoint wraps this logic.

### Project Requirements
- `.planning/REQUIREMENTS.md` — MSET-01, MSET-02 are Phase 1 scope
- `.planning/PROJECT.md` — Constraints section (dual backend, no new frameworks)

### Research
- `.planning/research/ARCHITECTURE.md` — DB schema recommendations, image storage paths, build order
- `.planning/research/PITFALLS.md` — P10 (cache busting), P11 (image size), P12 (missing static dir), P13 (dual backend sync), P14 (SQLite vs PostgreSQL column types)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server.ts` migration pattern (lines 53–57): try/catch `ALTER TABLE ... ADD COLUMN` — reuse exact pattern for bbox and lat/lon columns
- `main.py` migration pattern (line 87): `text("ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...")` — reuse for PostgreSQL migrations
- `FoodStreetBase`, `FoodStreetResponse` Pydantic models — extend with bbox fields and `map_image_path`
- `FoodVendorBase`, `FoodVendorResponse` Pydantic models — extend with `lat`, `lon` optional fields

### Established Patterns
- Route auth: `getUserFromToken(req)` (Express) / `get_current_user(token)` (FastAPI) — reuse on new routes
- Street response shape: `{ id, name, city, description, vendors_count }` — add `lat_nw, lon_nw, lat_se, lon_se, map_image_path` to this shape
- Static file serving: FastAPI already has `StaticFiles` pattern in `src/geolocation.py` — port to `main.py`

### Integration Points
- `POST /api/streets` and `PUT /api/streets/:id` — extend to accept bbox fields and trigger map generation
- `GET /api/streets` response — add bbox + map_image_path fields to each street object
- Frontend reads `street.map_image_path` in Phase 2 to decide whether to show MapView

</code_context>

<specifics>
## Specific Ideas

- No specific UI or interaction requirements this phase — pure backend
- Admin bbox input fields are Phase 2 work (admin form changes)
- The map PNG must be accessible via a plain `<img src="/maps/{id}.png">` tag in Phase 2

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 1 scope

</deferred>

---

*Phase: 01-backend-foundation*
*Context gathered: 2026-03-19*
