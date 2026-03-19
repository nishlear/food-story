# Requirements: Food Story — Interactive Map Feature

**Defined:** 2026-03-19
**Core Value:** When a user opens a food street that has a map, they see exactly where every vendor stall is — and (in v2) where they are standing.

## v1 Requirements

### Map Setup (Admin)

- [ ] **MSET-01**: Admin can add NW and SE lat/lon bounding box coordinates to a street (during create or edit)
- [ ] **MSET-02**: System generates a static map PNG from OpenStreetMap tiles when a street's bbox is saved
- [ ] **MSET-03**: Admin can tap on the street's map image to place a vendor pin; position is stored as lat/lon
- [ ] **MSET-04**: Admin sees a confirmation step ("Place pin here?") before a vendor pin position is saved

### Map View (User)

- [ ] **MVIEW-01**: When a street has a map, the map is the primary full-screen view (replaces vendor list)
- [ ] **MVIEW-02**: User can pinch-to-zoom and pan the map
- [ ] **MVIEW-03**: Streets without a map attached continue to show the existing vendor list UI
- [ ] **MVIEW-04**: Vendor pins appear at their correct geographic positions on the map (lat/lon projected to pixels)
- [ ] **MVIEW-05**: Vendor pin positions remain geographically accurate regardless of map zoom or display size

### Interaction

- [ ] **INT-01**: Tapping a vendor pin slides up the existing vendor detail bottom sheet
- [ ] **INT-02**: Vendors without a placed pin are not shown on the map (but remain accessible via list fallback)

## v2 Requirements

### GPS Location

- **GPS-01**: User's GPS location appears as a blue dot when within the street's bounding box
- **GPS-02**: Blue dot only shows when GPS accuracy is < 30m (accuracy circle shown otherwise)
- **GPS-03**: GPS acquiring indicator shown while waiting for an initial fix
- **GPS-04**: No blue dot shown if user is outside the street's bounding box
- **GPS-05**: GPS permission explanation prompt shown before browser permission dialog

## Out of Scope

| Feature | Reason |
|---------|--------|
| Turn-by-turn navigation | Wrong scale, routing infrastructure cost |
| Real-time vendor location sharing | Privacy concerns, WebSocket complexity |
| Vendor self-service pin placement | Admin-only for consistency |
| Tile-based map (Leaflet, Mapbox) | Static PNG approach is simpler and sufficient |
| Offline map caching | Static PNG already solves this |
| Map search / filter | 5–30 vendors is visual-scan territory |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MSET-01 | Phase 1 | Pending |
| MSET-02 | Phase 1 | Pending |
| MSET-03 | Phase 3 | Pending |
| MSET-04 | Phase 3 | Pending |
| MVIEW-01 | Phase 2 | Pending |
| MVIEW-02 | Phase 2 | Pending |
| MVIEW-03 | Phase 2 | Pending |
| MVIEW-04 | Phase 2 | Pending |
| MVIEW-05 | Phase 2 | Pending |
| INT-01 | Phase 2 | Pending |
| INT-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
