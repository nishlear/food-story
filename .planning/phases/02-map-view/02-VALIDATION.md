---
phase: 02
slug: map-view
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + jsdom |
| **Config file** | src/frontend/vitest.config.ts — Wave 0 installs |
| **Quick run command** | `cd src/frontend && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd src/frontend && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd src/frontend && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd src/frontend && npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | MVIEW-01 | infra | `cd src/frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | MVIEW-03 | unit | `cd src/frontend && npx vitest run src/frontend/src/utils/geoProjection.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | MVIEW-01 | manual | visual check | ✅ | ⬜ pending |
| 02-02-02 | 02 | 1 | MVIEW-02 | manual | gesture test | ✅ | ⬜ pending |
| 02-02-03 | 02 | 1 | MVIEW-03 | unit | `cd src/frontend && npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | MVIEW-04 | manual | tap interaction test | ✅ | ⬜ pending |
| 02-02-05 | 02 | 1 | MVIEW-05 | manual | visual check (no map) | ✅ | ⬜ pending |
| 02-02-06 | 02 | 1 | INT-01 | manual | end-to-end flow | ✅ | ⬜ pending |
| 02-02-07 | 02 | 1 | INT-02 | manual | end-to-end flow | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/frontend/vitest.config.ts` — vitest + jsdom configuration
- [ ] `src/frontend/src/utils/geoProjection.ts` — extracted pure geo-projection function
- [ ] `src/frontend/src/utils/geoProjection.test.ts` — unit tests for MVIEW-03 projection math
- [ ] `npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom` — test framework install

*Wave 0 installs test infrastructure and extracts the projection math as a testable pure function.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map fills screen as primary view | MVIEW-01 | Visual layout validation | Load a street with map_image_path set; confirm map fills container and vendor list is hidden |
| Pinch-to-zoom and pan gestures | MVIEW-02 | Requires touch device / gesture simulation | Test on mobile or Chrome DevTools touch mode; pinch to zoom, drag to pan |
| Pan-to-click suppression | MVIEW-04 | Library runtime behavior | Pan map, then tap a pin — confirm bottom sheet only opens on true tap, not after pan |
| Vendor list fallback intact | MVIEW-05 | Conditional branch | Load a street with no map_image_path; confirm vendor list renders unchanged |
| Bottom sheet opens on pin tap | MVIEW-04 | Touch interaction | Tap a vendor pin; confirm existing bottom sheet appears with correct vendor data |
| isAddingVendor disabled while zoomed | INT-01 | State interaction | Enter add-vendor mode, then zoom; confirm add-vendor button is disabled/faded |
| Street navigation preserves state | INT-02 | Cross-component state | Navigate between streets; confirm map state resets correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
