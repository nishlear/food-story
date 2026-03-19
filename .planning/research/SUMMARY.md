# Project Research Summary

**Project:** Food Story — Interactive Map + GPS Feature
**Domain:** Static-image map overlay with live GPS location for a food street vendor app
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This milestone adds an interactive map experience to an existing React + Express/FastAPI food street app. The approach is deliberately conservative: the app already has all the hard infrastructure (staticmap Python library, dual-backend pattern, React frontend), so the work is primarily wiring together existing pieces rather than introducing new architectural complexity. The one new dependency is `react-zoom-pan-pinch` for zoom/pan/pinch UX — everything else (map generation, image serving, browser GPS, coordinate projection) is achievable with what already exists.

The recommended architecture centers on a single Mercator projection utility (`mapProjection.ts`) that converts lat/lon to pixel coordinates and back. All vendor positions and the GPS blue dot use this same math, and the DB stores real lat/lon — never pixel coordinates. The map image is generated server-side via the existing `staticmap` library, stored as a static PNG, and served to the frontend. The `MapView` component wraps the image in `react-zoom-pan-pinch` with vendor pins and the GPS dot as absolute-positioned children inside the transform container.

The two highest-risk areas are: (1) GPS silently failing on non-HTTPS origins — mobile GPS testing requires ngrok or mkcert, never plain HTTP LAN; and (2) the dual-backend constraint (every endpoint must exist in both `server.ts` and `main.py`) — missing one causes silent production failures. Both are well-understood and preventable with process discipline.

## Key Findings

### Recommended Stack

The existing stack handles everything. The only new npm dependency is `react-zoom-pan-pinch` v3.x, which is purpose-built for CSS-transform-based zoom/pan/pinch on a static image with TypeScript types included. Tile-based map libraries (Leaflet, Mapbox, react-map-gl) are explicitly wrong for this use case — they assume a tiled map source, not a single static PNG. The browser's native Geolocation API with `watchPosition()` replaces the existing `geolocation.py` prototype cleanly.

**Core technologies:**
- `react-zoom-pan-pinch` v3.x: zoom/pan/pinch on static image — purpose-built, handles touch pinch, mouse wheel, and boundary clamping; TypeScript-native
- Browser Geolocation API (`watchPosition`): live GPS tracking — `enableHighAccuracy: true` required for GPS chip vs cell/WiFi fallback
- `staticmap` (already installed): server-side map PNG generation — existing `src/map.py` logic wrapped in a backend endpoint
- Mercator projection (`mapProjection.ts`): lat/lon to pixel math — shared by GPS dot, vendor pins, and admin tap-to-place
- ngrok: HTTPS for mobile GPS testing — fastest option, no phone setup required

### Expected Features

**Must have (table stakes):**
- Pinch-to-zoom and pan — mobile map baseline; users will not accept a static, unzoomable image
- Vendor pins visible and tappable (44px minimum hit area) — core feature of the map view
- Tap pin to open VendorBottomSheet — wires to existing component with no new UI work
- Blue dot at GPS position — the primary value prop of the "you are here" map
- GPS acquiring indicator — prevents silent-failure confusion when GPS is slow
- Graceful fallback to vendor list — streets without bbox coordinates must still work
- Map fills screen without letterboxing — CSS object-fit decision on the container

**Should have (differentiators):**
- Accuracy circle around blue dot — shows GPS uncertainty radius
- "You are outside this street" notice — triggered when GPS is acquired but user is outside bbox bounds
- Re-center on me button — returns map pan to user's blue dot position
- Color-coded pins by rating — green/yellow/red; minimal extra complexity
- Admin tap-to-place pin workflow — with confirmation overlay before saving to DB

**Defer to v2+:**
- Turn-by-turn navigation (wrong scale, routing infrastructure cost)
- Real-time vendor location sharing (privacy, WebSocket complexity)
- Cluster markers (5–30 vendors at zoom 19 — visual scan is sufficient)
- Search/filter on map (small vendor count makes this unnecessary)
- Vendor self-service pin placement (consistency breaks without admin control)

### Architecture Approach

The architecture adds two new DB columns to `streets` (bbox coordinates + `map_image_path` + `map_zoom`) and two columns to `vendors` (lat/lon), all nullable so existing data continues to work. The `MapView` component conditionally replaces the existing `MapInterface` when a street has a map image. A single `mapProjection.ts` utility handles all coordinate math. The `useGeolocation` hook wraps `watchPosition` with proper cleanup. All new backend routes must be mirrored across `server.ts` (Express/SQLite dev) and `main.py` (FastAPI/PostgreSQL prod).

**Major components:**
1. `mapProjection.ts` — Mercator math utility; forward (lat/lon → pixel) and inverse (pixel → lat/lon); single source of truth used by all map features
2. `MapView.tsx` — root map component; wraps image in react-zoom-pan-pinch; renders `VendorPin` and `GpsDot` as absolute-positioned children inside `TransformComponent`
3. `useGeolocation.ts` — `watchPosition` hook with module-level options constant and `clearWatch` cleanup
4. Map generation endpoint — wraps existing `staticmap` logic; triggered on street create/update when bbox is present; saves PNG to `static/maps/{street_id}.png`
5. Admin tap-to-place flow — uses `pixelToGps` inverse projection; confirmation overlay positioned above tap point to avoid finger occlusion

### Critical Pitfalls

1. **GPS silently fails on non-HTTPS** (HIGH risk) — `navigator.geolocation` returns `PERMISSION_DENIED` on plain HTTP LAN origins with no visible error. Use ngrok for all mobile GPS testing; never test over `192.168.x.x:3000`.

2. **Storing vendor positions as pixels** (HIGH risk) — Pixel coordinates break if image is displayed at a different size. Always store lat/lon in the DB; project to pixels at render time using `gpsToPixel`.

3. **Dual-backend endpoint sync** (HIGH risk) — Adding a route to `server.ts` without mirroring it in `main.py` causes silent 404s in production. Update both files in the same change every time.

4. **GPS options object causing infinite re-renders** (MEDIUM risk) — Inline `{ enableHighAccuracy: true }` in `useEffect` creates a new object every render, restarting `watchPosition` continuously. Define as a module-level const outside the component.

5. **Zoom level mismatch between generation and display** (MEDIUM risk) — `src/map.py` generates at zoom 19; if `mapProjection.ts` uses a different zoom, pins will be offset. Store `zoom` on the street record; never hardcode it in the frontend.

6. **Image dimensions not known at render time** (MEDIUM risk) — `gpsToPixel` requires `naturalWidth`/`naturalHeight`. Use `onLoad` event on `<img>` to capture these; only render pins after image loads.

7. **Missing `static/maps/` directory in Docker** (MEDIUM risk) — Image save fails silently on first run. Add `os.makedirs("static/maps", exist_ok=True)` at `main.py` startup and equivalent in `server.ts`.

## Implications for Roadmap

Based on the feature dependency tree and architecture, the build order is firmly determined by data dependencies. Each phase unblocks the next.

### Phase 1: DB Schema and Backend Foundation
**Rationale:** Everything downstream depends on the DB having bbox and lat/lon columns. Migration must come first so all subsequent phases can test against real data.
**Delivers:** Nullable bbox columns on `streets`, lat/lon columns on `vendors`, migration scripts for both SQLite and PostgreSQL, updated street/vendor API endpoints in both `server.ts` and `main.py`.
**Addresses:** Table stakes (streets without bbox continue to work via nullable columns)
**Avoids:** Pitfall P13 (dual-backend sync) — establish the habit of updating both files from the first backend change; Pitfall P14 (SQLite vs PostgreSQL type differences) — separate migration files from the start

### Phase 2: Map Generation and Image Serving
**Rationale:** The frontend map view needs a real image to display. This phase produces the PNG and the serving infrastructure before any UI work begins.
**Delivers:** Map generation endpoint (wraps `src/map.py` logic), `static/maps/` directory creation at startup, static file serving in both Express and FastAPI, `map_image_path` returned in street API responses.
**Uses:** `staticmap` (already installed), Express `express.static`, FastAPI `StaticFiles`
**Avoids:** Pitfall P12 (missing static directory), Pitfall P10 (browser caching — add `?v={timestamp}` query param to image URLs), Pitfall P11 (large PNG — cap at 2048×2048)

### Phase 3: MapView Component with Vendor Pins
**Rationale:** Build the visual map experience before GPS — GPS depends on the map container existing. This phase delivers the full map UX minus the blue dot.
**Delivers:** `mapProjection.ts` utility (forward + inverse), `MapView.tsx` with react-zoom-pan-pinch, `VendorPin.tsx` with 44px tap targets, conditional MapView vs vendor-list rendering in `MapInterface.tsx`, tap-pin → VendorBottomSheet wiring.
**Implements:** Core map component architecture; `react-zoom-pan-pinch` integration
**Avoids:** Pitfall P6 (always lat/lon in DB, project to pixels at render time), Pitfall P7 (pass `street.zoom` to all projection calls), Pitfall P8 (use `onLoad` to capture `naturalWidth`/`naturalHeight` before rendering pins), Pitfall P9 (pins must be inside `TransformComponent`)

### Phase 4: GPS Blue Dot
**Rationale:** GPS is isolated to a single hook and a single rendered element — cleanest to add after the map container is stable.
**Delivers:** `useGeolocation.ts` hook, `GpsDot.tsx` component with accuracy circle and pulsing animation, "GPS acquiring..." indicator, outside-bounds detection, re-center button.
**Addresses:** All table-stakes GPS features
**Avoids:** Pitfall P1 (use ngrok for mobile testing), Pitfall P2 (module-level `GEO_OPTIONS` const), Pitfall P3 (`clearWatch` cleanup in useEffect), Pitfall P4/P5 (document iOS backgrounding; show acquiring indicator for cold GPS delay)

### Phase 5: Admin Map Setup and Pin Placement
**Rationale:** Admin workflow is a separate user role flow that builds on the complete map foundation. Comes last because it requires the full map rendering pipeline to be in place.
**Delivers:** Bbox coordinate inputs in EditStreet modal, map image auto-generation on save, tap-to-place vendor pin workflow in `VendorEditModal.tsx`, confirmation overlay, "Add a map first" guard for streets without bbox.
**Implements:** Inverse projection (`pixelToGps`), admin map management UI
**Avoids:** Pitfall P15 (confirmation overlay positioned above tap point), Pitfall P16 (confirm before save, "try again" option), Pitfall P17 (disable tap-to-place if `map_image_path` is null)

### Phase Ordering Rationale

- **Data before UI:** Phases 1 and 2 establish the data model and image pipeline. No frontend work should start until a real map image can be served.
- **Core map before GPS:** Phase 3 builds the container that GPS renders into. The `mapProjection.ts` utility written in Phase 3 is reused without modification in Phase 4.
- **User features before admin tools:** Phase 4 (GPS) delivers user-facing value; Phase 5 (admin pin placement) is operational tooling. This order means the app is usable earlier.
- **Dual-backend discipline throughout:** Every backend phase (1, 2, 5) must update both `server.ts` and `main.py` in the same changeset.

### Research Flags

Phases with standard, well-documented patterns (can skip deeper research):
- **Phase 1 (DB schema):** Standard SQL migrations; nullable column additions are trivial in both SQLite and PostgreSQL
- **Phase 3 (MapView):** `react-zoom-pan-pinch` docs are complete; absolute positioning inside TransformComponent is a documented pattern
- **Phase 4 (GPS hook):** `GPS_LOCATION.md` provides a complete, copy-ready implementation

Phases that may benefit from a quick review before implementation:
- **Phase 2 (Map generation):** The Express child-process approach for calling the Python map generator in dev needs a decision — `child_process.execFile` vs porting the math to TypeScript. The TypeScript port is cleaner long-term but adds effort.
- **Phase 5 (Admin tap-to-place):** `getBoundingClientRect()` coordinate math relative to the zoomed/panned image needs careful testing on mobile — touch event coordinates vs mouse event coordinates differ.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | react-zoom-pan-pinch is the correct tool; all other stack choices use existing, already-installed dependencies |
| Features | HIGH | Feature set is tightly scoped to 5–30 vendors at zoom 19; anti-feature list is well-reasoned |
| Architecture | HIGH | Build order is determined by clear data dependencies; component boundaries are explicit |
| Pitfalls | HIGH | Pitfalls are specific to this codebase (dual-backend, existing map.py, mobile GPS) and verified against real constraints |

**Overall confidence:** HIGH

### Gaps to Address

- **Express map generation strategy:** The research recommends calling Python via `child_process.execFile` for dev, but does not provide the exact implementation. This is a small decision point that should be resolved at the start of Phase 2. Porting the Mercator math to TypeScript (already done in `mapProjection.ts` for frontend) and running `staticmap` calls only in the FastAPI backend is a cleaner alternative — the Express dev server would call the FastAPI endpoint or use a simpler placeholder.

- **Accuracy circle rendering math:** The formula `radius = accuracy / metersPerPixel` where `metersPerPixel ≈ 156543 * cos(lat) / 2^zoom` is documented in GPS_LOCATION.md but not unit-tested. Validate with a known GPS fix before wiring to UI.

- **Cache-busting strategy:** The research recommends `?v={updated_at_timestamp}` on map image URLs. The `streets` table does not currently have an `updated_at` column — either add it in Phase 1 or use a simpler counter/random suffix.

## Sources

### Primary (HIGH confidence)
- `src/map.py` (existing codebase) — staticmap usage, Mercator projection math, zoom 19 baseline
- `CLAUDE.md` (project constraints) — dual-backend requirement, Express/FastAPI route mirroring, auth system
- MDN Geolocation API — `watchPosition`, `enableHighAccuracy`, `clearWatch`, accuracy field
- OSM slippy map tile math — `lonToTileX`, `latToTileY` Mercator formulas

### Secondary (MEDIUM confidence)
- react-zoom-pan-pinch v3 docs — TransformWrapper/TransformComponent API, absolute-child positioning pattern
- ngrok / mkcert documentation — HTTPS setup for mobile GPS testing

### Tertiary (LOW confidence)
- `getBoundingClientRect()` for admin tap coordinate math — standard DOM API but interaction with react-zoom-pan-pinch transform state needs empirical validation during Phase 5 implementation

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
