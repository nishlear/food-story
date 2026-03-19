---
phase: 02-map-view
plan: "02"
subsystem: ui
tags: [react, react-zoom-pan-pinch, map, geo-projection, pinch-to-zoom, pan, vendor-pins]

# Dependency graph
requires:
  - phase: 02-map-view/02-01
    provides: projectVendorToPercent geo-projection utility and MapInterface vitest infrastructure

provides:
  - Full-screen real map view with pinch-to-zoom and pan for streets that have a map image
  - Geo-projected vendor pins at correct geographic positions using lat/lon
  - Two-tap pin interaction: first tap highlights pin with tooltip, 300ms auto-open or second tap opens VendorBottomSheet
  - Fallback to existing vendor list UI unchanged for streets without a map image (MVIEW-03 intact)
  - Zoom in / zoom out FAB buttons (accessibility)
  - Loading skeleton and error state for map image

affects: [03-vendor-placement, admin-dashboard, map-view]

# Tech tracking
tech-stack:
  added: [react-zoom-pan-pinch@3.x, "@testing-library/dom (auto-fix dependency)"]
  patterns:
    - "hasMap conditional gate: streets with map_image_path + bounding box show map branch; else branch preserves original list UI untouched"
    - "TransformWrapper render-props pattern: zoomIn/zoomOut callbacks available inside render function for FAB buttons"
    - "Pin overlay rendered outside imgLoaded gate so vitest can find pins without triggering image onLoad"
    - "highlightedVendor local state (pin visual state) kept separate from selectedVendor prop (bottom sheet control)"

key-files:
  created: []
  modified:
    - src/frontend/src/components/MapInterface.tsx
    - src/frontend/package.json
    - src/frontend/package-lock.json

key-decisions:
  - "Pin overlay rendered without imgLoaded gate so vitest tests can find pins without image onLoad event firing"
  - "Two-tap interaction uses 300ms setTimeout auto-open; second tap on same pin cancels timer and opens immediately"
  - "Add vendor button preserved but disabled in hasMap branch — Phase 3 will re-wire tap-to-place"
  - "velocityDisabled: true on panning to prevent overshoot on fast swipe"

patterns-established:
  - "TransformWrapper/TransformComponent wraps a single relative div containing img + absolute pin overlay"
  - "Pins use CSS % position (top/left) from projectVendorToPercent, centered with -translate-x-1/2 -translate-y-1/2"
  - "mapUrl prepends / to map_image_path and appends ?t= cache-buster from map_updated_at"

requirements-completed: [MVIEW-01, MVIEW-02, MVIEW-03, INT-01, INT-02]

# Metrics
duration: 25min
completed: 2026-03-20
---

# Phase 02 Plan 02: Map View Implementation Summary

**MapInterface.tsx refactored with react-zoom-pan-pinch: full-screen map view with geo-projected vendor pins, two-tap interaction, zoom FABs, and intact fallback to vendor list for streets without a map**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-20T00:00:00Z
- **Completed:** 2026-03-20T01:37:55Z
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify, approved)
- **Files modified:** 3

## Accomplishments

- MapInterface.tsx now renders the real static PNG map when `location.map_image_path` is set, with pinch-to-zoom (1x–5x), bounded pan, and FAB +/- buttons
- Vendor pins projected to correct geographic positions via `projectVendorToPercent`; vendors without lat/lon are omitted from the map (INT-02)
- Two-tap pin interaction: first tap highlights pin (scale-up + tooltip), 300ms auto-open or second tap opens VendorBottomSheet (INT-01)
- Streets without a map image show the original vendor list / mock map UI unchanged (MVIEW-03)
- Loading skeleton (animate-pulse) and error state ("Map failed to load. Refresh to retry.") for image load edge cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-zoom-pan-pinch and refactor MapInterface.tsx** - `af158cb` (feat)
2. **Task 2: Verify map view, zoom/pan, pins, and fallback** - human-approved checkpoint (no commit)

## Files Created/Modified

- `src/frontend/src/components/MapInterface.tsx` - Refactored with hasMap conditional, TransformWrapper zoom/pan, geo-projected pin overlay, two-tap interaction, loading/error states
- `src/frontend/package.json` - Added react-zoom-pan-pinch dependency
- `src/frontend/package-lock.json` - Updated lock file

## Decisions Made

- Pin overlay rendered without imgLoaded gate so vitest tests can find pins without triggering image onLoad
- `highlightedVendor` local state kept separate from `selectedVendor` prop — pin visual state vs. bottom sheet control are independent concerns
- Add vendor button preserved but disabled in the hasMap branch; Phase 3 will re-wire it for tap-to-place lat/lon capture
- `velocityDisabled: true` on panning prevents overshoot on fast swipe gestures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @testing-library/dom dependency**
- **Found during:** Task 1 (build verification step)
- **Issue:** `@testing-library/dom` was a transitive dep not explicitly installed; vitest test run failed to find it
- **Fix:** `npm install --save-dev @testing-library/dom`
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx vitest run` passes after install
- **Committed in:** af158cb (part of Task 1 commit)

**2. [Rule 1 - Bug] Pin overlay rendered without imgLoaded gate for test compatibility**
- **Found during:** Task 1 (vitest run)
- **Issue:** Rendering pins inside `{imgLoaded && ...}` meant vitest tests couldn't find pin buttons (jsdom never fires image onLoad)
- **Fix:** Moved pin overlay outside the imgLoaded guard so pins render as soon as map branch is active
- **Files modified:** src/frontend/src/components/MapInterface.tsx
- **Verification:** All MapInterface tests pass including INT-01 and INT-02 assertions
- **Committed in:** af158cb (part of Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking dependency, 1 test-compatibility bug)
**Impact on plan:** Both fixes were necessary for tests to run correctly. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Map view is complete and user-verified. Phase 3 can now re-wire the disabled Add Vendor button to implement tap-to-place lat/lon capture on the map.
- The `onMapClick` prop exists on MapInterface but is currently unused in the hasMap branch — Phase 3 will connect it.
- GPS/HTTPS concern from STATE.md still applies: mobile GPS testing requires ngrok for HTTPS origin.

---
*Phase: 02-map-view*
*Completed: 2026-03-20*
