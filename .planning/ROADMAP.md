# Roadmap: Food Story — Interactive Map Feature

## Overview

This milestone adds an interactive map layer to the existing food street vendor app. Starting from the data model (DB schema + map generation backend), moving to the full user-facing map view (vendor pins, zoom/pan, conditional rendering), and finishing with the admin tooling to place vendor pins on the map. Each phase unblocks the next; no frontend map work starts until the backend can serve a real map image.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Backend Foundation** - DB schema migrations + map generation endpoint + static image serving (completed 2026-03-19)
- [x] **Phase 2: Map View** - MapView component with vendor pins, zoom/pan, conditional rendering, and pin interactions (completed 2026-03-20)
- [ ] **Phase 3: Admin Pin Placement** - Admin tap-to-place vendor pin workflow with confirmation

## Phase Details

### Phase 1: Backend Foundation
**Goal**: The system can store bounding boxes, generate static map PNGs from OSM tiles, and serve them to the frontend — with no regressions on existing street/vendor flows
**Depends on**: Nothing (first phase)
**Requirements**: MSET-01, MSET-02
**Success Criteria** (what must be TRUE):
  1. Admin can save NW and SE lat/lon coordinates on a street via the edit/create form, and those values are persisted in the database
  2. When a street with a bounding box is saved, a static PNG map image is generated and stored server-side
  3. The street API response includes a `map_image_path` field when a map exists, and the image is accessible via a static file URL
  4. Streets without a bounding box continue to load and display normally (no regressions)
  5. All new backend routes exist in both `server.ts` and `main.py`
**Plans:** 1/1 plans complete

Plans:
- [x] 01-01-PLAN.md — Schema migrations, map generation, and static file serving (both backends)

### Phase 2: Map View
**Goal**: Users at a food street with a map see the map as the primary full-screen experience — with vendor pins at their correct geographic positions, zoom/pan controls, and pin-tap interaction wired to the existing bottom sheet
**Depends on**: Phase 1
**Requirements**: MVIEW-01, MVIEW-02, MVIEW-03, MVIEW-04, MVIEW-05, INT-01, INT-02
**Success Criteria** (what must be TRUE):
  1. When a street has a map image, the map fills the screen as the primary view (vendor list is not shown)
  2. User can pinch-to-zoom and pan the map with smooth touch/mouse gestures
  3. Vendor pins appear at their correct geographic positions on the map, and positions remain accurate regardless of zoom level or display size
  4. Tapping a vendor pin opens the existing vendor detail bottom sheet for that vendor
  5. Streets without a map image continue to show the existing vendor list UI unchanged
**Plans:** 2/2 plans complete

Plans:
- [x] 02-01-PLAN.md — Test infrastructure (vitest) and geo-projection utility with tests
- [x] 02-02-PLAN.md — MapInterface refactor: real map, zoom/pan, geo-projected pins, pin interactions, fallback

### Phase 3: Admin Pin Placement
**Goal**: Admins can tap anywhere on the street map image to set a vendor's geographic location — with a confirmation step before saving — giving admins a visual, intuitive workflow for positioning vendor stalls
**Depends on**: Phase 2
**Requirements**: MSET-03, MSET-04
**Success Criteria** (what must be TRUE):
  1. Admin can tap the map image in the vendor edit flow and a candidate pin position is shown at the tap location
  2. Admin sees a confirmation prompt ("Place pin here?") before the pin position is committed to the database
  3. Confirmed pin positions are stored as lat/lon (not pixels) and immediately appear on the map at the correct location
  4. Admin cannot enter tap-to-place mode on a street that has no map image attached
**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — Inverse geo-projection utility (percentToLatLon) with TDD + Express vendor PUT lat/lon fix
- [ ] 03-02-PLAN.md — MapInterface pin-placement mode, VendorEditModal trigger, App.tsx state machine wiring

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Foundation | 1/1 | Complete   | 2026-03-19 |
| 2. Map View | 2/2 | Complete | 2026-03-20 |
| 3. Admin Pin Placement | 0/2 | Not started | - |
