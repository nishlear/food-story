# Phase 2: Map View - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the mock map background in `MapInterface.tsx` with the real static PNG from Phase 1, project vendor lat/lon coordinates to pixel positions on the image, and add zoom/pan gesture support. Pin taps open the existing `VendorBottomSheet`. Streets without a map image continue to show the existing vendor list UI unchanged.

Requirements: MVIEW-01, MVIEW-02, MVIEW-03, MVIEW-04, MVIEW-05, INT-01, INT-02

</domain>

<decisions>
## Implementation Decisions

### Zoom & Pan Implementation
- Use `react-zoom-pan-pinch` library (purpose-built for this use case, ~15kb, not a framework)
- Bounded zoom: min 1x (can't zoom out past original), max 5x
- Gestures supported: pinch-to-zoom on mobile, mouse wheel on desktop, drag to pan
- On-screen +/- buttons provided in addition to gestures (accessibility, discoverability)
- Buttons positioned in the existing right-side FAB column (below settings, above add-vendor)

### MapInterface Refactor Strategy
- Extend `MapInterface.tsx` in-place — no new component file
- Conditional logic: if `location.map_image_path` is non-null → show real map with geo-projected pins; else → show existing vendor list (no regressions)
- App.tsx routing and props interface unchanged
- Admin "add vendor" mode (`isAddingVendor`, `onMapClick`, crosshair cursor, + button): **preserve but disable** — button visible but non-functional on real map. Phase 3 re-wires it with lat/lon tap-to-place.

### Unpinned Vendor Handling
- Vendors without `lat`/`lon` are **silently omitted** from the map — no count badge, no list
- Consistent with INT-02 requirement
- Admin responsibility to place pins before vendors appear on map

### Pin Design
- Keep exact same design as current mock map:
  - Unselected: white circle (w-10 h-10) with orange border, orange `MapPin` icon
  - Selected: filled orange circle, white `MapPin` icon, scaled 1.25x
- Tap behavior: **single tap → pin scales up + name tooltip appears above pin** → second tap (or 300ms auto-open) opens `VendorBottomSheet`
- This matches the existing `selectedVendor` state pattern already in the codebase

### Geo-Projection (Claude's Discretion)
- Project vendor lat/lon to pixel % using same Mercator math as `src/map.py` (`lon_to_tile_x`, `lat_to_tile_y`)
- Projection uses the street's bounding box (lat_nw, lon_nw, lat_se, lon_se) to map coordinates to 0–100% of the image
- Pins positioned with `style={{ top: '${y}%', left: '${x}%' }}` — same pattern as current x/y mock pins

### Claude's Discretion
- Exact +/- button styling and positioning within FAB column
- Auto-open timeout for tooltip → bottom sheet (suggested 300ms)
- Image loading state (skeleton or spinner while PNG loads)
- Cache-busting: append `?t=${map_updated_at}` query param to the `<img src>` URL to force reload on regeneration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Frontend Code
- `src/frontend/src/components/MapInterface.tsx` — Current mock map component being extended. Vendor pin rendering pattern (x/y %), isAddingVendor mode, FAB layout.
- `src/frontend/src/components/VendorBottomSheet.tsx` — Bottom sheet already wired. Triggered via `onSelectVendor` prop in App.tsx. No changes needed in Phase 2.
- `src/frontend/src/App.tsx` — Root state and screen routing. `selectedLocation` object will have `map_image_path`, `lat_nw`, `lon_nw`, `lat_se`, `lon_se` from Phase 1.

### Map Generation (Phase 1 output)
- `src/backend/map_utils.py` — `generate_map_png(lat_nw, lon_nw, lat_se, lon_se, zoom, output_path)`. Projection math source of truth.
- `src/map.py` — Original prototype with `lon_to_tile_x`, `lat_to_tile_y` projection functions. Port this math to TypeScript for frontend pin projection.

### Project Requirements
- `.planning/REQUIREMENTS.md` — MVIEW-01 through MVIEW-05, INT-01, INT-02 are Phase 2 scope
- `.planning/PROJECT.md` — Constraints: no new frameworks (react-zoom-pan-pinch is a utility library, acceptable), dual backend not relevant for frontend-only phase

### Phase 1 Context (decisions that flow into Phase 2)
- `.planning/phases/01-backend-foundation/01-CONTEXT.md` — Vendor lat/lon columns, map_image_path format (`maps/{id}.png`), static serving at `/maps/`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MapInterface.tsx` vendor pin rendering: `style={{ top: '${vendor.y}%', left: '${vendor.x}%' }}` — reuse exact pattern, swap `x`/`y` for projected lat/lon percentages
- `MapInterface.tsx` selectedVendor state pattern: pin scales up + tooltip on selection — keep as-is, just change trigger from `onClick` to two-tap sequence
- `VendorBottomSheet.tsx`: fully implemented, no changes needed — just call `onSelectVendor(vendor)` on pin tap
- Framer Motion `motion.div` and `AnimatePresence` already imported across components — use for any animation needs

### Established Patterns
- Components use Tailwind CSS exclusively — no inline styles except for dynamic positioning (top/left %)
- FAB layout: `absolute right-4 top-4 z-30 flex flex-col gap-3` — add +/- buttons to this column
- Animation: `motion/react` (Framer Motion v11 import path) — use for pin scale transitions

### Integration Points
- `location.map_image_path` — check this to branch between real map and vendor list
- `location.lat_nw`, `location.lon_nw`, `location.lat_se`, `location.lon_se` — bounding box for projection
- `vendor.lat`, `vendor.lon` — new columns from Phase 1; null for vendors without placed pins
- `vendor.x`, `vendor.y` — old mock-map CSS percentages; ignore in map view, keep for backward compat

</code_context>

<specifics>
## Specific Ideas

- Projection math in TypeScript: `lonToPercent = (lon - lon_nw) / (lon_se - lon_nw) * 100`, `latToPercent = (lat_nw - lat) / (lat_nw - lat_se) * 100` (latitude is inverted — north is top)
- The `react-zoom-pan-pinch` library is used: wrap the `<img>` and pin overlay div in `<TransformWrapper>` + `<TransformComponent>`
- +/- buttons use `useControls()` hook from `react-zoom-pan-pinch`

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 2 scope

</deferred>

---

*Phase: 02-map-view*
*Context gathered: 2026-03-19*
