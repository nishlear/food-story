# Phase 02: Map View - Research

**Researched:** 2026-03-19
**Domain:** React map rendering, zoom/pan gestures, lat/lon geo-projection to CSS pixels
**Confidence:** HIGH — decisions are locked, code is inspected directly, library API verified

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Zoom & Pan Implementation**
- Use `react-zoom-pan-pinch` library (purpose-built for this use case, ~15kb, not a framework)
- Bounded zoom: min 1x (can't zoom out past original), max 5x
- Gestures supported: pinch-to-zoom on mobile, mouse wheel on desktop, drag to pan
- On-screen +/- buttons provided in addition to gestures (accessibility, discoverability)
- Buttons positioned in the existing right-side FAB column (below settings, above add-vendor)

**MapInterface Refactor Strategy**
- Extend `MapInterface.tsx` in-place — no new component file
- Conditional logic: if `location.map_image_path` is non-null → show real map with geo-projected pins; else → show existing vendor list (no regressions)
- App.tsx routing and props interface unchanged
- Admin "add vendor" mode (`isAddingVendor`, `onMapClick`, crosshair cursor, + button): **preserve but disable** — button visible but non-functional on real map. Phase 3 re-wires it with lat/lon tap-to-place.

**Unpinned Vendor Handling**
- Vendors without `lat`/`lon` are silently omitted from the map — no count badge, no list
- Consistent with INT-02 requirement
- Admin responsibility to place pins before vendors appear on map

**Pin Design**
- Keep exact same design as current mock map:
  - Unselected: white circle (w-10 h-10) with orange border, orange `MapPin` icon
  - Selected: filled orange circle, white `MapPin` icon, scaled 1.25x
- Tap behavior: **single tap → pin scales up + name tooltip appears above pin** → second tap (or 300ms auto-open) opens `VendorBottomSheet`
- This matches the existing `selectedVendor` state pattern already in the codebase

**Geo-Projection (Claude's Discretion)**
- Project vendor lat/lon to pixel % using same Mercator math as `src/map.py` (`lon_to_tile_x`, `lat_to_tile_y`)
- Projection uses the street's bounding box (lat_nw, lon_nw, lat_se, lon_se) to map coordinates to 0–100% of the image
- Pins positioned with `style={{ top: '${y}%', left: '${x}%' }}` — same pattern as current x/y mock pins

### Claude's Discretion
- Exact +/- button styling and positioning within FAB column
- Auto-open timeout for tooltip → bottom sheet (suggested 300ms)
- Image loading state (skeleton or spinner while PNG loads)
- Cache-busting: append `?t=${map_updated_at}` query param to the `<img src>` URL to force reload on regeneration

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 2 scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MVIEW-01 | When a street has a map, the map is the primary full-screen view (replaces vendor list) | Conditional branch on `location.map_image_path` in MapInterface; `<img>` inside TransformComponent fills container |
| MVIEW-02 | User can pinch-to-zoom and pan the map | `react-zoom-pan-pinch` v3.7.0 — TransformWrapper/TransformComponent wrapping the `<img>` + pin overlay |
| MVIEW-03 | Streets without a map continue to show the existing vendor list UI | Existing vendor list JSX path preserved unchanged behind `else` branch |
| MVIEW-04 | Vendor pins appear at their correct geographic positions on the map | Linear Mercator projection — `x = (lon - lon_nw) / (lon_se - lon_nw) * 100`, `y = (lat_nw - lat) / (lat_nw - lat_se) * 100` |
| MVIEW-05 | Vendor pin positions remain geographically accurate regardless of zoom or display size | Pins live inside TransformComponent; they scale/pan with the image so % offsets remain stable |
| INT-01 | Tapping a vendor pin slides up the existing vendor detail bottom sheet | Two-tap sequence: first tap sets selectedVendor (pin scales); 300ms setTimeout triggers `onSelectVendor(vendor)` which App.tsx relays to VendorBottomSheet |
| INT-02 | Vendors without a placed pin are not shown on the map | Filter vendors array: skip any vendor where `vendor.lat == null || vendor.lon == null` before rendering pins |
</phase_requirements>

---

## Summary

Phase 2 is a pure frontend change. `MapInterface.tsx` gains a conditional branch: when the selected street carries a `map_image_path`, it renders the real static PNG inside a `react-zoom-pan-pinch` TransformWrapper and projects vendor lat/lon coordinates to CSS percentage positions inside TransformComponent. When no map exists the existing vendor-list path is untouched.

The geo-projection is a linear bounding-box mapping — the same math already used in `src/map.py` and `src/backend/map_utils.py`. Because the PNG was generated to exactly cover the bounding box, the linear approximation is accurate for the ~few-hundred-metre scale of a food street (Mercator nonlinearity is negligible).

The two-tap pin interaction is a small state machine: first tap selects the vendor and starts a 300ms timer; the timer fires `onSelectVendor` unless the user cancelled. `useControls()` from react-zoom-pan-pinch must be called from a component that is a **descendant of TransformWrapper**, so the zoom buttons need to be in an inner component (or use the render-props pattern the library supports).

**Primary recommendation:** Implement all changes inside `MapInterface.tsx`. Use the render-prop pattern of `TransformWrapper` (children as function) to scope the `+`/`-` zoom button callbacks without creating an extra component file.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-zoom-pan-pinch | 3.7.0 (latest) | Touch + mouse zoom/pan/pinch on any DOM element | Purpose-built, ~15 kB, zero dependencies, user-approved |
| motion/react (Framer Motion v12) | ^12.23.24 (in package.json) | Pin scale animation, screen transitions | Already installed, used throughout codebase |
| lucide-react | ^0.546.0 (in package.json) | `Plus`, `Minus` icons for zoom FABs | Already installed, used throughout codebase |
| Tailwind CSS v4 | ^4.1.14 (in package.json) | Utility CSS — FAB layout, skeleton, pin styles | Already installed, project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React 19 built-ins (`useRef`, `useState`, `useEffect`) | ^19.0.0 | Timer management for 300ms auto-open, image load state | No additional install needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-zoom-pan-pinch | Leaflet / react-leaflet | Tile-based, far heavier — explicitly out of scope |
| react-zoom-pan-pinch | CSS transform + pointer events | 200+ lines of custom code; multi-touch maths are subtle |
| Linear bbox projection | Proper Web Mercator tile math | Unnecessary precision for <500m street scale; adds complexity |

**Installation:**
```bash
cd src/frontend && npm install react-zoom-pan-pinch
```

**Version verification (confirmed 2026-03-19):**
```bash
npm view react-zoom-pan-pinch version   # → 3.7.0
```

---

## Architecture Patterns

### Component Structure (all within MapInterface.tsx)

```
MapInterface.tsx
├── hasMap branch (location.map_image_path !== null)
│   └── <TransformWrapper minScale={1} maxScale={5}>
│       {({ zoomIn, zoomOut }) => (
│         <>
│           <TransformComponent>
│             <div style={{ position: 'relative', width, height }}>
│               <img src={mapUrl} … />          ← full-bleed PNG
│               {pinnedVendors.map(…)}           ← vendor pins (absolute %)
│             </div>
│           </TransformComponent>
│           <FABs zoomIn={zoomIn} zoomOut={zoomOut} />  ← outside TransformComponent
│         </>
│       )}
│     </TransformWrapper>
└── noMap branch (existing vendor list — unchanged)
```

### Pattern 1: TransformWrapper Render-Props for Zoom Controls

**What:** `TransformWrapper` can accept a function as `children` that receives `{ zoomIn, zoomOut, resetTransform, ...state }`. This avoids creating a separate component just to call `useControls()`.

**When to use:** When zoom control buttons live in the same JSX tree as `TransformComponent` but OUTSIDE it (they must not be transformed with the map).

**Example:**
```typescript
// Source: react-zoom-pan-pinch GitHub README (verified 2026-03-19)
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

<TransformWrapper minScale={1} maxScale={5} limitToBounds={true}>
  {({ zoomIn, zoomOut }) => (
    <>
      <TransformComponent>
        {/* content that zooms */}
      </TransformComponent>
      {/* buttons outside TransformComponent — not transformed */}
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
    </>
  )}
</TransformWrapper>
```

### Pattern 2: Geo-Projection (Linear Bbox Mapping)

**What:** Convert vendor lat/lon to CSS percentage offsets using the street's bounding box corners.

**When to use:** When the PNG was generated to exactly cover the bbox (true for all Phase 1 maps).

**Example:**
```typescript
// Source: src/map.py and src/backend/map_utils.py (project code, inspected 2026-03-19)
function projectToPercent(
  lat: number, lon: number,
  lat_nw: number, lon_nw: number,
  lat_se: number, lon_se: number
): { x: number; y: number } {
  const x = (lon - lon_nw) / (lon_se - lon_nw) * 100;
  // Latitude is inverted: NW is top (y=0), SE is bottom (y=100)
  const y = (lat_nw - lat) / (lat_nw - lat_se) * 100;
  return { x, y };
}
```

### Pattern 3: Two-Tap Pin Interaction State Machine

**What:** First tap selects pin and starts a timer; timer fires bottom sheet open after 300ms.

**When to use:** Provides visual feedback (scale + tooltip) before the heavy bottom sheet slides in.

**Example:**
```typescript
// Pseudocode — implementation detail for planner
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handlePinTap(vendor: any) {
  if (selectedVendor?.id === vendor.id) {
    // Second tap — open immediately
    if (timerRef.current) clearTimeout(timerRef.current);
    onSelectVendor(vendor);
  } else {
    // First tap — show tooltip, schedule auto-open
    setSelectedVendor(vendor);  // local state for scale/tooltip
    timerRef.current = setTimeout(() => onSelectVendor(vendor), 300);
  }
}
```

Note: `setSelectedVendor` here refers to local pin-highlight state. `onSelectVendor` is the App.tsx callback that opens VendorBottomSheet. The planner must decide whether to lift the "highlighted pin" state or keep it local — both work.

### Pattern 4: Pin Overlay Inside TransformComponent

**What:** Pins must be absolutely positioned children inside `TransformComponent` so they transform (scale/pan) with the image.

**Critical detail:** `TransformComponent` wraps a single child. The image and the pin overlay div must both be children of a single container div inside `TransformComponent`.

```typescript
<TransformComponent>
  <div className="relative" style={{ width: '100%', height: '100%' }}>
    <img
      src={`/maps/${location.id}.png?t=${location.map_updated_at}`}
      alt={`Map of ${location.name}`}
      className="w-full h-full object-contain"
      onLoad={() => setImgLoaded(true)}
      onError={() => setImgError(true)}
    />
    {/* Pin overlay — same dimensions as img */}
    <div className="absolute inset-0">
      {pinnedVendors.map(vendor => {
        const { x, y } = projectToPercent(vendor.lat, vendor.lon, ...bbox);
        return (
          <button
            key={vendor.id}
            style={{ top: `${y}%`, left: `${x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 ..."
            onClick={() => handlePinTap(vendor)}
          />
        );
      })}
    </div>
  </div>
</TransformComponent>
```

### Anti-Patterns to Avoid

- **FAB buttons inside TransformComponent:** If +/- zoom buttons are placed inside the TransformComponent div, they will pan/zoom with the map — they must be siblings of TransformComponent, rendered via the render-props function or useControls in a child component.
- **useControls at top level of MapInterface:** `useControls()` must be called from within a component that is a descendant of `TransformWrapper`. Calling it at the top of MapInterface will throw because MapInterface itself is not inside a wrapper.
- **Rendering pins outside TransformComponent:** Pins placed in the outer motion.div will not pan/pan with the map — they'll float at fixed screen coordinates.
- **Using vendor.x / vendor.y for geo-projection:** These are legacy CSS mock percentages (not geographic). Use `vendor.lat` / `vendor.lon` with the bbox projection only.
- **Forgetting latitude inversion:** Latitude increases northward; CSS `top` increases downward. The y formula must be `(lat_nw - lat) / (lat_nw - lat_se) * 100`, NOT `(lat - lat_nw) / ...`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pinch-to-zoom on touch | Custom pointer event handler | react-zoom-pan-pinch | Touch event math (multi-finger, scale pivot, momentum) is ~500 lines of subtle code |
| Mouse wheel zoom | `onWheel` handler with CSS transform | react-zoom-pan-pinch | Trackpad vs scroll wheel normalisation, zoom-to-cursor pivot |
| Bounded pan | `clamp()` on translate state | `limitToBounds={true}` prop | Edge cases with various zoom levels and image aspect ratios |

**Key insight:** Gesture libraries handle browser inconsistencies (passive event listener warnings, Safari touch handling, Firefox scroll behaviour) that would take days to debug.

---

## Common Pitfalls

### Pitfall 1: useControls Called Outside TransformWrapper Scope
**What goes wrong:** `useControls()` throws or returns no-op functions; +/- buttons do nothing.
**Why it happens:** The hook reads context set by `TransformWrapper`; if there is no ancestor wrapper, context is undefined.
**How to avoid:** Always use the render-props pattern `<TransformWrapper>{({ zoomIn, zoomOut }) => ...}</TransformWrapper>` or create a named inner component and render it as a child of `TransformWrapper`.
**Warning signs:** "Cannot read properties of undefined" errors in console; zoom buttons render but have no effect.

### Pitfall 2: Latitude Inversion in Projection
**What goes wrong:** Pins appear at the mirror-image vertical position (south vendors appear at top, north at bottom).
**Why it happens:** Geographic latitude increases northward but CSS `top` increases downward.
**How to avoid:** y formula must be `(lat_nw - lat) / (lat_nw - lat_se) * 100`. Test with a vendor you know is in the NW corner — it should appear near top-left (x≈0, y≈0).
**Warning signs:** Pins appear on the map but at wrong positions, mirrored vertically.

### Pitfall 3: Map URL Without Cache-Busting
**What goes wrong:** After an admin regenerates the map PNG, the browser shows the old cached image.
**Why it happens:** The image URL `/maps/{id}.png` is static and the browser caches aggressively.
**How to avoid:** Append `?t=${location.map_updated_at}` to the `<img src>`. Phase 1 stores `map_updated_at` on the street row (confirmed in server.ts line 72).
**Warning signs:** Admin saves new bbox, page refreshes, old map image still shows.

### Pitfall 4: TransformComponent Child Must Be a Single Element
**What goes wrong:** React error "TransformComponent must have a single child element."
**Why it happens:** `TransformComponent` expects exactly one direct child.
**How to avoid:** Always wrap the `<img>` and pin overlay in a single `<div className="relative">` before passing to `TransformComponent`.
**Warning signs:** Console error on mount.

### Pitfall 5: Pin Tap Events Blocked by TransformWrapper Pan Gesture
**What goes wrong:** Panning the map triggers vendor pin onClick handlers — unwanted bottom sheet opens during pan.
**Why it happens:** react-zoom-pan-pinch fires pointer events; a pan gesture starting on a pin can fire click.
**How to avoid:** Check `onTransformed` state or use the library's `onPanning` prop to set a flag; suppress onClick during active pan. Alternatively the library may handle this via internal event suppression — verify with manual testing. If needed: track pan distance in `onPanningStart`/`onPanningStop` and ignore clicks when pan distance > threshold (e.g. 5px).
**Warning signs:** Vendor bottom sheet pops open while dragging the map.

### Pitfall 6: Timer Leak on Component Unmount
**What goes wrong:** `Cannot perform a React state update on an unmounted component` warning, or bottom sheet opens after user navigated back.
**Why it happens:** The 300ms auto-open timer fires after the component unmounts (user tapped back during the delay).
**How to avoid:** Store timer ref in `useRef`, clear it in a `useEffect` cleanup: `return () => { if (timerRef.current) clearTimeout(timerRef.current); }`.
**Warning signs:** React warning in console about state update on unmounted component.

---

## Code Examples

### Full Projection Function (TypeScript)
```typescript
// Source: port of src/map.py (inspected 2026-03-19)
export function projectVendorToPercent(
  vendorLat: number,
  vendorLon: number,
  lat_nw: number,
  lon_nw: number,
  lat_se: number,
  lon_se: number
): { x: number; y: number } {
  const x = (vendorLon - lon_nw) / (lon_se - lon_nw) * 100;
  const y = (lat_nw - vendorLat) / (lat_nw - lat_se) * 100;
  return { x, y };
}
```

### Map Image URL with Cache-Busting
```typescript
// Source: CONTEXT.md decision — map_updated_at stored in Phase 1 (server.ts line 72)
const mapUrl = `/maps/${location.id}.png` +
  (location.map_updated_at ? `?t=${encodeURIComponent(location.map_updated_at)}` : '');
```

### Image Loading State
```typescript
// Tailwind skeleton while img loads, error fallback after failure
const [imgLoaded, setImgLoaded] = useState(false);
const [imgError, setImgError] = useState(false);

// In JSX:
{!imgLoaded && !imgError && (
  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
)}
{imgError && (
  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
    Map failed to load. Refresh to retry.
  </div>
)}
<img
  src={mapUrl}
  alt={`Map of ${location.name}`}
  className={`w-full h-full object-contain ${imgLoaded ? '' : 'invisible'}`}
  onLoad={() => setImgLoaded(true)}
  onError={() => setImgError(true)}
/>
```

### Filtering Pinned Vendors
```typescript
// Source: CONTEXT.md (INT-02 decision)
const pinnedVendors = vendors.filter(
  v => v.lat != null && v.lon != null
);
```

### Disabling the isAddingVendor Button in Phase 2
```typescript
// Source: CONTEXT.md — preserve but disable; Phase 3 re-wires
{canAddVendor && (
  <button
    onClick={undefined}
    disabled={true}
    aria-label="Add vendor"
    className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors opacity-50 cursor-not-allowed bg-white text-gray-700"
  >
    <Plus className="w-6 h-6" />
  </button>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Import from `framer-motion` | Import from `motion/react` | Framer Motion v11+ | Already correct in codebase — `motion/react` is the current import path |
| `react-zoom-pan-pinch` v2.x (class component API) | v3.x (hooks + render props) | v3.0 (2022) | v3 API is what's on npm latest; use render-props or `useControls` |

**Deprecated/outdated:**
- `vendor.x` / `vendor.y` fields: legacy CSS mock coordinates — present in DB but ignored in the real map view. Still used by the existing vendor-list fallback path (do not remove).

---

## Open Questions

1. **Pan-during-tap event suppression**
   - What we know: react-zoom-pan-pinch fires normal click events; panning starts on a pin could fire onClick.
   - What's unclear: Whether the library suppresses click after pan internally (v3.7 behavior).
   - Recommendation: Implement and test on touch device; add pan-distance guard if spurious opens occur.

2. **TransformComponent container sizing**
   - What we know: The PNG can be any pixel dimension; `object-contain` will letterbox it.
   - What's unclear: Whether `minScale=1` should mean "full container height" or "actual image pixels at 1:1". With `object-contain` the image may be smaller than the container, making `minScale=1` allow the user to "zoom into" whitespace padding.
   - Recommendation: Set the container div to `w-full h-full` and test with a real map PNG. If letterboxing is awkward, use `object-cover` instead — discuss with user in Phase 3 if it matters.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no vitest.config.*, no jest.config.*, no test scripts in package.json |
| Config file | None — Wave 0 must create `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0) |
| Full suite command | `npx vitest run` (after Wave 0) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MVIEW-01 | MapInterface renders `<img>` when `map_image_path` is set | unit | `npx vitest run src/frontend/src/components/MapInterface.test.tsx -t "renders map image"` | Wave 0 |
| MVIEW-03 | MapInterface renders vendor list when `map_image_path` is null | unit | `npx vitest run src/frontend/src/components/MapInterface.test.tsx -t "renders vendor list fallback"` | Wave 0 |
| MVIEW-04 | `projectVendorToPercent` returns correct x/y for known coords | unit | `npx vitest run src/frontend/src/utils/geoProjection.test.ts` | Wave 0 |
| MVIEW-05 | Projection result is identical regardless of calling it at different zoom states | unit | covered by MVIEW-04 test (pure function, no DOM) | Wave 0 |
| INT-02 | Vendors with null lat/lon are excluded from pinnedVendors | unit | `npx vitest run src/frontend/src/components/MapInterface.test.tsx -t "omits unpinned vendors"` | Wave 0 |
| MVIEW-02 | TransformWrapper is rendered in map mode | unit (render check) | `npx vitest run src/frontend/src/components/MapInterface.test.tsx -t "renders TransformWrapper"` | Wave 0 |
| INT-01 | onSelectVendor called after 300ms on pin tap | unit (timer) | `npx vitest run src/frontend/src/components/MapInterface.test.tsx -t "pin tap auto-opens bottom sheet"` | Wave 0 |

Note: INT-01 requires fake timers (`vi.useFakeTimers()`). MVIEW-02 may require mocking react-zoom-pan-pinch since it renders canvas/transform CSS.

### Sampling Rate
- **Per task commit:** `npx vitest run src/frontend/src/utils/geoProjection.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/frontend/vitest.config.ts` — vitest + jsdom config
- [ ] `src/frontend/src/utils/geoProjection.ts` — extracted projection function (pure, easily testable)
- [ ] `src/frontend/src/utils/geoProjection.test.ts` — covers MVIEW-04, MVIEW-05
- [ ] `src/frontend/src/components/MapInterface.test.tsx` — covers MVIEW-01, MVIEW-03, MVIEW-06, INT-01, INT-02
- [ ] Install: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`

---

## Sources

### Primary (HIGH confidence)
- `src/frontend/src/components/MapInterface.tsx` — Inspected directly; existing pin pattern, FAB layout, selectedVendor state
- `src/frontend/src/App.tsx` — Inspected directly; onSelectVendor wiring, location object shape
- `src/frontend/server.ts` lines 64–85 — Inspected directly; confirms `map_updated_at`, `map_image_path`, `lat`/`lon` columns exist from Phase 1
- `src/map.py` and `src/backend/map_utils.py` — Inspected directly; projection math source of truth
- `.planning/phases/02-map-view/02-CONTEXT.md` — All locked decisions and discretion areas
- `.planning/phases/02-map-view/02-UI-SPEC.md` — Approved design contract for all new elements
- `npm view react-zoom-pan-pinch version` → `3.7.0` (verified 2026-03-19)

### Secondary (MEDIUM confidence)
- GitHub: `BetterTyped/react-zoom-pan-pinch` README — confirmed render-props API pattern and `useControls` scoping requirement
- `src/frontend/package.json` — All dependency versions confirmed

### Tertiary (LOW confidence)
- `limitToBounds`, `minScale`, `maxScale` default values — confirmed by name from WebSearch but not individually verified against source TypeScript types. Should be verified in implementation.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package version confirmed via npm, library already approved by user
- Architecture: HIGH — based on direct code inspection; projection math is the same function as the Python source
- Pitfalls: MEDIUM-HIGH — pan-during-tap suppression is library-version-specific and needs runtime verification
- Test infrastructure: HIGH — no tests exist, confirmed by filesystem scan

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (react-zoom-pan-pinch is stable; Tailwind/React are not fast-moving within a locked project)
