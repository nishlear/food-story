# Stack Research: Interactive Map + GPS Feature

**Date:** 2026-03-19
**Milestone:** Subsequent — adding map/GPS to existing React + Express/FastAPI app

## Recommendation Summary

No major new dependencies needed. Add `react-zoom-pan-pinch` for zoom/pan UX. Everything else (staticmap, Express static, FastAPI StaticFiles, browser Geolocation API) is already available or trivial to wire up.

## Zoom/Pan on Static Image

**Recommendation: `react-zoom-pan-pinch` v3.x** — Confidence: HIGH

- Purpose-built for CSS-transform-based zoom/pan/pinch on a static `<img>`
- Handles touch pinch, mouse wheel, boundary clamping
- Exposes context for reading current scale/position
- TypeScript types included
- Install: `npm install react-zoom-pan-pinch`

**Why NOT alternatives:**
- Leaflet / Mapbox: tile-based map libraries — wrong tool for a static image overlay
- Framer Motion drag: no zoom, no pinch, no boundary clamping
- CSS `transform` + manual gesture handlers: high complexity, re-inventing the wheel

**Vendor pins on zoomed map:**
Place vendor pin `<div>` elements as `position: absolute` children inside `<TransformComponent>`. They inherit the CSS transform automatically — no per-frame recalculation needed. Pixel positions computed once from lat/lon via Mercator math.

## Map Image Generation

**Recommendation: Wrap existing `src/map.py` logic in a backend endpoint** — Confidence: HIGH

- `staticmap` library already installed and working
- New endpoint: `POST /api/streets/:id/generate-map` (or trigger on street create/update with coords)
- Saves to `src/frontend/static/maps/{street_id}.png` (Express) / `src/static/maps/{street_id}.png` (FastAPI)
- Return the image path in the street object

**No new Python libraries needed.**

## Image Serving

**Express (dev):** `app.use('/maps', express.static('static/maps'))` — one line before Vite middleware
**FastAPI (prod):** `app.mount("/maps", StaticFiles(directory="static/maps"))` — already has pattern in `geolocation.py`

Frontend accesses map via: `<img src="/maps/{street_id}.png" />`

## GPS (Browser Geolocation API)

**Recommendation: `navigator.geolocation.watchPosition()` in a custom React hook** — Confidence: HIGH

Full implementation in `.planning/research/GPS_LOCATION.md`. Key points:
- `enableHighAccuracy: true` required for GPS chip (not cell/WiFi)
- Define options object outside component to avoid restarting effect
- `clearWatch(watchId)` in useEffect cleanup
- Only show blue dot when `accuracy < 30m`

## HTTPS for Local Dev (GPS on Mobile)

**Recommendation: ngrok for demos/testing** — Confidence: HIGH

```bash
ngrok http 3000  # ~60 seconds, public HTTPS URL, no phone setup
```

For team dev: `mkcert` (offline LAN, phone needs to trust root CA).
Self-signed certs (like `geolocation.py` approach) will cause mobile GPS blocks — avoid for this use case.

## What NOT to Use

| Library | Why Not |
|---------|---------|
| Leaflet / Mapbox GL | Tile-based — wrong for static image overlay |
| react-map-gl | Same — wraps Mapbox, overkill |
| OpenLayers | Same issue, plus large bundle |
| Framer Motion drag | No zoom/pinch support |
| Manual touch handlers | High complexity, cross-browser issues |

## Summary

| Need | Solution | New Dependency? |
|------|----------|----------------|
| Zoom/pan map | react-zoom-pan-pinch v3 | YES (npm) |
| Vendor pins | CSS absolute positioning inside TransformComponent | No |
| Map generation | Wrap existing staticmap in endpoint | No |
| Image serving | Express static / FastAPI StaticFiles | No |
| GPS hook | Browser Geolocation API + useGeolocation hook | No |
| HTTPS local dev | ngrok | No (external tool) |

---
*Research date: 2026-03-19*
