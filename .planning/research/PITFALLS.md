# Pitfalls Research: Interactive Map + GPS

**Date:** 2026-03-19
**Milestone:** Subsequent — adding map/GPS to existing React + Express/FastAPI app

## GPS Pitfalls

### P1: GPS silently fails on non-HTTPS origins
**Risk:** HIGH
**Problem:** `navigator.geolocation` returns `PERMISSION_DENIED` on `192.168.x.x:3000` (plain HTTP). The error fires silently with no visual indication — users see no blue dot and don't know why.
**Prevention:** Use ngrok (`ngrok http 3000`) for any mobile GPS testing. Never test GPS over plain HTTP LAN.
**Phase:** GPS blue dot implementation

### P2: GPS options object causing infinite re-renders
**Risk:** MEDIUM
**Problem:** Defining `{ enableHighAccuracy: true, timeout: 10000 }` inline in `useEffect` creates a new object reference every render, restarting `watchPosition` continuously. This drains battery and causes the blue dot to flicker.
**Prevention:** Define options object outside the component (module-level const) or inside `useMemo`.
**Phase:** GPS blue dot implementation

### P3: Not cleaning up watchPosition on unmount
**Risk:** MEDIUM
**Problem:** Forgetting `return () => navigator.geolocation.clearWatch(watchId)` in the useEffect cleanup keeps the GPS radio active even after the user navigates away. Battery drain + memory leak.
**Prevention:** Always return a cleanup function. The `useGeolocation` hook template in `GPS_LOCATION.md` handles this correctly.
**Phase:** GPS blue dot implementation

### P4: iOS throttles GPS in background tabs
**Risk:** LOW
**Problem:** On iOS Safari, `watchPosition` updates stop when the tab is backgrounded. Blue dot freezes.
**Prevention:** Expected browser behavior — no fix needed. Document it. Show "location may be stale" if last update > 10s.
**Phase:** GPS blue dot implementation

### P5: Cold GPS acquisition delay (no fix available)
**Risk:** LOW
**Problem:** First GPS fix can take 5–30 seconds outdoors. Users see no blue dot and think it's broken.
**Prevention:** Show a pulsing "Acquiring location..." indicator immediately on mount. Only hide it when `accuracy < 30m`.
**Phase:** GPS blue dot implementation

## Coordinate Projection Pitfalls

### P6: Using pixel coordinates to store vendor positions
**Risk:** HIGH
**Problem:** Storing vendor position as `{x: 120, y: 340}` in the DB breaks if the image is displayed at a different size. This is the most common mistake in "pin on image" features.
**Prevention:** ALWAYS store as lat/lon. Project to pixels at render time using Mercator math. The `gpsToPixel` function is stateless and cheap to call.
**Phase:** DB schema + vendor pin rendering

### P7: Zoom level mismatch between generation and display
**Risk:** MEDIUM
**Problem:** `src/map.py` generates at zoom 19. If the projection math in `mapProjection.ts` uses a different zoom level, vendor pins and the blue dot will be offset. Subtle bug, hard to spot in testing.
**Prevention:** Store `zoom` on the street record (default 19). Pass it to all `gpsToPixel`/`pixelToGps` calls. Never hardcode zoom in the frontend.
**Phase:** Mercator utility implementation

### P8: Image dimensions not known at render time
**Risk:** MEDIUM
**Problem:** `gpsToPixel` requires `imgW` and `imgH`. If you compute these before the `<img>` has loaded (or use CSS-scaled dimensions instead of natural dimensions), pins will be misaligned.
**Prevention:** Use `onLoad` event on `<img>` to capture `naturalWidth` and `naturalHeight`. Store in component state. Only render pins after image is loaded.
**Phase:** MapView component

### P9: react-zoom-pan-pinch transforms pins incorrectly
**Risk:** LOW
**Problem:** If vendor pins are placed outside `<TransformComponent>`, they won't zoom/pan with the map.
**Prevention:** Pins must be `position: absolute` children INSIDE `<TransformComponent>`, siblings of `<img>`. The CSS transform then applies to all children uniformly.
**Phase:** MapView component

## Image Serving Pitfalls

### P10: Street ID filename collision on regeneration
**Risk:** LOW
**Problem:** Overwriting `static/maps/3.png` on every bbox update is correct, but browser caches the old image. User sees stale map.
**Prevention:** Append a cache-busting query param to the image URL: `/static/maps/{id}.png?v={updated_at_timestamp}`. Store `map_updated_at` on the street record, or use a simple counter.
**Phase:** Map image generation

### P11: Large PNG images (>2MB) slow map load
**Risk:** MEDIUM
**Problem:** At zoom 19, a large bounding box generates a very large image. 500×500 meters at zoom 19 = ~3000×3000px PNG.
**Prevention:** Cap image dimensions in the generation endpoint (e.g., max 2048×2048). Warn admin if their bounding box produces an image > 1MB. Use PNG compression (staticmap default is reasonable).
**Phase:** Map image generation

### P12: Missing static directory in Docker
**Risk:** MEDIUM
**Problem:** `src/static/maps/` may not exist in the Docker container on first run, causing image save to fail silently.
**Prevention:** `os.makedirs("static/maps", exist_ok=True)` at app startup in `main.py`. Same for Express: `fs.mkdirSync` on startup.
**Phase:** Backend endpoint

## Dual Backend Sync Pitfalls

### P13: Adding endpoint to server.ts but forgetting main.py
**Risk:** HIGH
**Problem:** This project's dual-backend constraint (CLAUDE.md) means every route must exist in both. Missing one causes production (Docker) to return 404 while dev works fine.
**Prevention:** After every backend change, immediately update the parallel backend. Use a checklist comment at the top of `server.ts` referencing `main.py`.
**Phase:** Every backend phase

### P14: SQLite vs PostgreSQL column type differences
**Risk:** LOW
**Problem:** SQLite stores REAL freely; PostgreSQL requires explicit `DOUBLE PRECISION` or `FLOAT8`. Schema drift causes migration failures.
**Prevention:** Use `REAL` in SQLite migration, `DOUBLE PRECISION` in PostgreSQL migration. Keep separate migration files.
**Phase:** DB schema

## Admin UX Pitfalls

### P15: Finger occludes tap target on mobile
**Risk:** MEDIUM
**Problem:** When admin taps to place a vendor pin, their finger covers the exact location. The pin appears under their finger — they can't see if it's precise.
**Prevention:** Show the confirmation overlay slightly above the tap point (e.g., `top: tapY - 80px`). Include a micro-map preview of the pinned location.
**Phase:** Admin tap-to-place

### P16: No undo for pin placement
**Risk:** LOW
**Problem:** Accidental taps during admin pin placement are hard to undo — user must re-open vendor edit and re-place.
**Prevention:** Confirmation dialog before saving ("Place pin here? [Confirm] [Try again]"). "Try again" dismisses confirmation and re-enables tapping.
**Phase:** Admin tap-to-place

### P17: Admin places pin without a map attached to the street
**Risk:** LOW
**Problem:** Admin tries to place vendor pin on a street without bbox coordinates set. No map to tap on.
**Prevention:** Disable "Place on map" in vendor edit if `street.map_image_path` is null. Show tooltip: "Add a map to this street first."
**Phase:** Admin tap-to-place

---
*Research date: 2026-03-19*
