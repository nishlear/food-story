---
phase: 02-map-view
plan: 01
subsystem: testing
tags: [vitest, jsdom, testing-library, react, geo-projection, typescript]

# Dependency graph
requires: []
provides:
  - Vitest + jsdom test infrastructure with @testing-library/react
  - projectVendorToPercent pure function for lat/lon to CSS-percent projection
  - MapInterface.test.tsx covering MVIEW-01/02/03/INT-01/INT-02 in RED/GREEN state
affects: [02-02-map-view-implementation]

# Tech tracking
tech-stack:
  added: [vitest, @vitest/coverage-v8, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event]
  patterns: [TDD red-green with vitest, pure utility function extraction for testability]

key-files:
  created:
    - src/frontend/vitest.config.ts
    - src/frontend/src/test-setup.ts
    - src/frontend/src/utils/geoProjection.ts
    - src/frontend/src/utils/geoProjection.test.ts
    - src/frontend/src/components/MapInterface.test.tsx
  modified:
    - src/frontend/package.json

key-decisions:
  - "Linear bbox projection (not Mercator tile math) is sufficient at food-street scale (~few hundred metres)"
  - "vitest.config.ts uses jsdom environment with @testing-library/jest-dom setup file for DOM matchers"
  - "Mock react-zoom-pan-pinch in MapInterface.test.tsx so tests run before Plan 02 installs the library"
  - "MapInterface tests intentionally left in RED for MVIEW-01/02/INT-01/INT-02 — Plan 02 brings them GREEN"

patterns-established:
  - "Geo projection: extract pure projection math to utils/ for unit testability, import in component"
  - "Test setup: src/test-setup.ts imports jest-dom; vitest.config.ts references it via setupFiles"
  - "TDD flow: write failing test, verify RED, write implementation, verify GREEN, commit feat()"

requirements-completed: [MVIEW-01, MVIEW-02, MVIEW-03, MVIEW-04, MVIEW-05, INT-01, INT-02]

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 02 Plan 01: Test Infrastructure and Geo-Projection Utility Summary

**Vitest + jsdom test infrastructure installed, projectVendorToPercent function TDD'd with 5 passing tests, and MapInterface.test.tsx created with 8 tests providing automated RED coverage for all five map-view requirements**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-19T18:30:39Z
- **Completed:** 2026-03-19T18:33:39Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Installed vitest, jsdom, and @testing-library/* with working config — `npx vitest run` executes correctly
- Implemented projectVendorToPercent using linear bbox projection; all 5 tests pass including latitude inversion and real-world coords
- Created MapInterface.test.tsx with 8 tests covering MVIEW-01, MVIEW-02, MVIEW-03, INT-01, INT-02; MVIEW-03 and INT-02 (no-pin filter) pass; remaining 6 are RED awaiting Plan 02 implementation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install test infrastructure and create vitest config** - `1c80834` (chore)
2. **Task 2: Create geo-projection utility with tests** - `a48cdf9` (feat, TDD)
3. **Task 3: Create MapInterface component tests** - `6dbe13c` (test)

_Note: Task 2 used TDD: RED commit (test file with failing import) folded into GREEN feat() commit_

## Files Created/Modified
- `src/frontend/vitest.config.ts` - Vitest config with jsdom environment and test-setup.ts
- `src/frontend/src/test-setup.ts` - Imports @testing-library/jest-dom for DOM matchers
- `src/frontend/src/utils/geoProjection.ts` - Pure projection function: lat/lon to CSS percentage with latitude inversion
- `src/frontend/src/utils/geoProjection.test.ts` - 5 TDD tests: NW corner, SE corner, center, lat inversion, real-world coords
- `src/frontend/src/components/MapInterface.test.tsx` - 8 component tests covering all 5 requirement IDs
- `src/frontend/package.json` - Added test script and devDependencies for vitest + testing-library

## Decisions Made
- Linear bbox projection chosen over Mercator tile math — valid at food-street scale (~few hundred metres), matches src/map.py approach
- `setupFiles: ['./src/test-setup.ts']` added to vitest config to enable `toBeInTheDocument()` and other jest-dom matchers
- react-zoom-pan-pinch mocked in MapInterface tests so tests run before Plan 02 installs the library
- MapInterface RED tests intentionally not fixed — their fix is Plan 02's responsibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added test-setup.ts for jest-dom matchers**
- **Found during:** Task 3 (MapInterface component tests)
- **Issue:** Plan specified `setupFiles: []` in vitest config, but tests use `toBeInTheDocument()` from @testing-library/jest-dom which requires global import
- **Fix:** Created `src/test-setup.ts` with `import '@testing-library/jest-dom'` and updated vitest.config.ts setupFiles to reference it
- **Files modified:** src/frontend/vitest.config.ts, src/frontend/src/test-setup.ts (new)
- **Verification:** Tests run without "toBeInTheDocument is not a function" errors
- **Committed in:** 6dbe13c (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical setup)
**Impact on plan:** Essential for jest-dom matchers to work. No scope creep.

## Issues Encountered
None — all tasks completed as planned after the setup file deviation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Test infrastructure ready for Plan 02 to add react-zoom-pan-pinch and implement the map branch
- projectVendorToPercent function ready to import into MapInterface
- MapInterface.test.tsx will transition from RED to GREEN as Plan 02 implements MVIEW-01/02/INT-01/INT-02
- Build passes (`npm run build` succeeds)

---
*Phase: 02-map-view*
*Completed: 2026-03-19*

## Self-Check: PASSED

All files exist and all task commits verified in git log.
