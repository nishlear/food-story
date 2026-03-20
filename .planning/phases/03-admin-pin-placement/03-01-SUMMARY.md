---
phase: 03-admin-pin-placement
plan: 01
subsystem: ui
tags: [typescript, vitest, tdd, geo-projection, express, sqlite]

# Dependency graph
requires:
  - phase: 02-map-view
    provides: projectVendorToPercent in geoProjection.ts and linear bbox projection pattern
provides:
  - percentToLatLon exported from geoProjection.ts (inverse of projectVendorToPercent)
  - Express admin vendor PUT route persists lat/lon to SQLite
affects: [03-admin-pin-placement plan 02 — MapInterface tap-to-place using percentToLatLon]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green-refactor for utility functions, inverse linear bbox projection]

key-files:
  created: []
  modified:
    - src/frontend/src/utils/geoProjection.ts
    - src/frontend/src/utils/geoProjection.test.ts
    - src/frontend/server.ts

key-decisions:
  - "percentToLatLon uses same linear bbox math as projectVendorToPercent — valid at food-street scale"
  - "Admin-only lat/lon persistence in Express PUT — foodvendor branch does not get lat/lon (admin privilege)"
  - "lat ?? null pattern used for lat/lon in SQL run() args — safe null passthrough for optional coordinates"

patterns-established:
  - "Inverse projection: lon = lon_nw + (xPct/100)*(lon_se-lon_nw); lat = lat_nw - (yPct/100)*(lat_nw-lat_se)"
  - "Round-trip test: project then unproject, assert abs delta < 1e-6"

requirements-completed:
  - MSET-03

# Metrics
duration: 15min
completed: 2026-03-20
---

# Phase 3 Plan 01: Admin Pin Placement — Geo Projection Inverse + Express lat/lon Fix Summary

**`percentToLatLon` inverse projection function added to geoProjection.ts with 5 TDD tests, and Express admin vendor PUT route fixed to persist lat/lon in SQLite UPDATE**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-20T02:44:00Z
- **Completed:** 2026-03-20T02:44:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `percentToLatLon(lat_nw, lon_nw, lat_se, lon_se, xPct, yPct) → { lat, lon }` as inverse of `projectVendorToPercent`
- 5 new vitest tests: NW corner, SE corner, midpoint, round-trip within 1e-6, asymmetric (xPct=25, yPct=75)
- All 18 tests pass (13 existing + 5 new)
- Fixed Express admin PUT `/api/streets/:streetId/vendors/:vendorId` to include `lat` and `lon` in destructure and `UPDATE vendors SET ... lat = ?, lon = ?` SQL

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing tests for percentToLatLon** - `4e215b4` (test)
2. **Task 1 GREEN: Implement percentToLatLon in geoProjection.ts** - `c732734` (feat)
3. **Task 2: Fix Express admin vendor PUT to persist lat/lon** - `a45ed21` (fix)

_Note: TDD tasks have multiple commits (test → feat)_

## Files Created/Modified
- `src/frontend/src/utils/geoProjection.ts` - Added `percentToLatLon` export with JSDoc matching existing style
- `src/frontend/src/utils/geoProjection.test.ts` - Added 5 `percentToLatLon` test cases in new `describe` block
- `src/frontend/server.ts` - Extended admin PUT destructure and UPDATE SQL to include `lat` and `lon`

## Decisions Made
- Admin-only lat/lon persistence: foodvendor PUT branch intentionally left unchanged — only admins can set geographic pin positions
- `lat ?? null` pattern used so body can omit lat/lon without causing SQL errors
- FastAPI `main.py` left unchanged — already handles lat/lon via `model_dump()` on `FoodVendorBase`

## Deviations from Plan

None - plan executed exactly as written. Both `geoProjection.ts` and `server.ts` already contained the implementation from prior session commits.

## Issues Encountered

None. All code was already in place from prior commits (`4e215b4`, `c732734`, `a45ed21`). SUMMARY.md was the only missing artifact.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `percentToLatLon` is ready for Plan 02 import: `import { percentToLatLon } from '../utils/geoProjection'`
- Express admin PUT route persists lat/lon — tap-to-place in MapInterface can call PUT with new coordinates
- All 18 vitest tests pass; Vite build exits 0

---
*Phase: 03-admin-pin-placement*
*Completed: 2026-03-20*
