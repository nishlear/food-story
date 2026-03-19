# Architecture Research: Interactive Map + GPS

**Date:** 2026-03-19
**Milestone:** Subsequent — adding map/GPS to existing React + Express/FastAPI app

## DB Schema Changes

### streets table (add columns)

```sql
ALTER TABLE streets ADD COLUMN lat_nw REAL;       -- NW corner latitude
ALTER TABLE streets ADD COLUMN lon_nw REAL;        -- NW corner longitude
ALTER TABLE streets ADD COLUMN lat_se REAL;        -- SE corner latitude
ALTER TABLE streets ADD COLUMN lon_se REAL;        -- SE corner longitude
ALTER TABLE streets ADD COLUMN map_image_path TEXT; -- e.g. "static/maps/3.png"
ALTER TABLE streets ADD COLUMN map_zoom INTEGER DEFAULT 19;
```

All bbox columns nullable — streets without coordinates use the existing vendor list UI.

### vendors table (add columns)

```sql
ALTER TABLE vendors ADD COLUMN lat REAL;  -- vendor stall latitude (null = not placed)
ALTER TABLE vendors ADD COLUMN lon REAL;  -- vendor stall longitude (null = not placed)
```

Nullable — vendors without coordinates are hidden from map view but still accessible via list fallback.

## Map Image Generation Flow

```
Admin saves street with bbox coords
  → POST /api/streets (create) or PUT /api/streets/:id (update)
  → Backend detects lat_nw/lon_nw/lat_se/lon_se present
  → Calls map generation function (wraps src/map.py logic)
  → Saves PNG to static/maps/{street_id}.png
  → Stores relative path in streets.map_image_path
  → Returns updated street object (includes map_image_path)
```

**Image storage:**
- Express (dev): `src/frontend/static/maps/{street_id}.png`
- FastAPI (prod): `src/static/maps/{street_id}.png`
- Served via: `/static/maps/{street_id}.png`

**Regeneration:** Regenerate on every bbox update (overwrite). No versioning needed for v1.

**Map generation in FastAPI:** Extract the math from `src/map.py` into a utility function called by the street create/update endpoint. Add `staticmap` as a dependency in `pyproject.toml` (already present).

**Map generation in Express:** Call a child Python process (`python3 src/map.py`) or extract math to a Node.js port. Simpler: call a dedicated Python script via `child_process.execFile`. For dev this is acceptable.

## Mercator Projection Utility

Single source of truth — shared by:
1. GPS lat/lon → pixel (blue dot rendering)
2. Vendor lat/lon → pixel (pin rendering)
3. Tap pixel → lat/lon (admin pin placement)

**Location:** `src/frontend/src/utils/mapProjection.ts`

```typescript
export function lonToTileX(lon: number, z: number): number
export function latToTileY(lat: number, z: number): number
export function gpsToPixel(lat, lon, latNW, lonNW, latSE, lonSE, imgW, imgH, zoom): {x,y} | null
export function pixelToGps(px, py, latNW, lonNW, latSE, lonSE, imgW, imgH, zoom): {lat, lon}
```

Both forward (lat/lon → pixel) and inverse (pixel → lat/lon) must be implemented. The inverse is used only by the admin tap-to-place flow.

## Component Hierarchy

### New components

```
MapView.tsx                    ← Replaces MapInterface when street has bbox
  ├── TransformWrapper          (react-zoom-pan-pinch)
  │     └── TransformComponent
  │           ├── <img src="/static/maps/{id}.png" />
  │           ├── VendorPin.tsx  (absolute positioned, one per vendor)
  │           └── GpsDot.tsx     (absolute positioned, updates from useGeolocation)
  └── VendorBottomSheet.tsx      (existing, shown on pin tap)

useGeolocation.ts              ← watchPosition hook (from GPS_LOCATION.md)
mapProjection.ts               ← Mercator math utility
```

### Modified components

```
App.tsx                        ← Pass street.map_image_path down to map screen
MapInterface.tsx               ← Conditionally render MapView vs existing list UI
AdminVendorsTab.tsx            ← Add lat/lon display + "place on map" action
VendorEditModal.tsx            ← Add tap-to-place map picker
AdminStreetsTab.tsx / EditStreet modal ← Add bbox coordinate inputs
```

## Suggested Build Order

1. **DB schema** — Add bbox columns to streets, lat/lon to vendors. Migration scripts for both SQLite (dev) and PostgreSQL (prod).

2. **Backend endpoints** — Add bbox fields to street create/update. Add map generation. Add vendor lat/lon to vendor create/update. Update both `server.ts` AND `main.py`.

3. **Mercator utility** — Implement `mapProjection.ts` with both forward and inverse functions. Unit test with known coordinates from `src/map.py`.

4. **MapView component** — Static image + react-zoom-pan-pinch + vendor pins (no GPS yet). Test with a real street.

5. **Admin map setup** — Bbox inputs in EditStreet modal, tap-to-place in vendor edit flow.

6. **GPS blue dot** — Add `useGeolocation` hook, render `GpsDot` inside `MapView`. Test with ngrok HTTPS on mobile.

## Data Flow: Map Render

```
App.tsx fetches GET /api/streets
  → street.map_image_path present?
      → Yes: render <MapView street={street} vendors={vendors} />
      → No: render existing <MapInterface /> (vendor list)

MapView:
  → <img src={street.map_image_path} onLoad={captureImageDimensions} />
  → vendors.filter(v => v.lat && v.lon)
      .map(v => gpsToPixel(v.lat, v.lon, ...bbox, imgW, imgH, zoom))
      .map(pos => <VendorPin style={{left: pos.x, top: pos.y}} />)
  → useGeolocation() → {lat, lon, accuracy}
      → gpsToPixel(lat, lon, ...bbox, imgW, imgH, zoom)
      → pos !== null → <GpsDot style={{left: pos.x, top: pos.y}} />
```

## Data Flow: Admin Tap-to-Place

```
Admin taps on map image in VendorEditModal
  → getBoundingClientRect() → compute tap pixel relative to image
  → pixelToGps(px, py, ...street.bbox, imgW, imgH, zoom) → {lat, lon}
  → Show confirmation overlay
  → Admin confirms → PUT /api/streets/:id/vendors/:vid {lat, lon}
  → Vendor pin appears on map
```

---
*Research date: 2026-03-19*
