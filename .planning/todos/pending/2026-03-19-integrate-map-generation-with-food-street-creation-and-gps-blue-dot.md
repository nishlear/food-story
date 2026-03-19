---
created: 2026-03-19T09:07:13.017Z
title: Integrate map generation with food street creation and GPS blue dot
area: ui
files:
  - src/map.py
  - src/geolocation.py
  - src/backend/main.py
  - src/frontend/server.ts
  - src/frontend/src/App.tsx
  - src/frontend/src/components/LocationSelection.tsx
---

## Problem

Admin needs to create a food street with a geographic bounding box (NW top-left and SE bottom-right lon-lat). The app should:
1. Generate a static map image (using staticmap + OpenStreetMap tiles, like `src/map.py`) for that bounding box at zoom 19
2. Store and serve the map image per-street
3. When a user opens a food street, display the map as the background with zoom/pan support
4. Acquire user's current GPS location (browser Geolocation API or mobile — see `src/geolocation.py` for HTTPS-based approach)
5. If the user's GPS position falls within the street bounding box, render a live blue dot at the correct pixel position on the map — using Mercator projection math to convert lon-lat → pixel coords (same math as `src/map.py` lines 9–18)

## Solution

**Backend changes (both `main.py` and `server.ts`):**
- Add `lat_nw`, `lon_nw`, `lat_se`, `lon_se` fields to the streets table/schema
- On street creation (POST /streets), run map generation (staticmap) and save the image (e.g. `static/maps/{street_id}.png`)
- Serve the map image via a static file route

**Frontend changes:**
- Street creation form (admin): add bounding box coordinate inputs (4 fields)
- Street view: render map image as background; add pinch/wheel zoom + pan (e.g. react-zoom-pan-pinch or CSS transform)
- GPS: call `navigator.geolocation.watchPosition()` for live updates
- Blue dot: project GPS lon-lat to pixel position using the same Mercator tile math from `src/map.py`, scaled to image dimensions. Formula:
  - `px = (lon_to_tile_x(lon) - lon_to_tile_x(lon_nw)) / (lon_to_tile_x(lon_se) - lon_to_tile_x(lon_nw)) * imageWidth`
  - `py = (lat_to_tile_y(lat) - lat_to_tile_y(lat_nw)) / (lat_to_tile_y(lat_se) - lat_to_tile_y(lat_nw)) * imageHeight`
- Only show blue dot if GPS coords are within the bounding box

**Research needed:**
- Best way to acquire GPS on mobile browser (HTTPS required — see geolocation.py)
- Whether to use browser Geolocation API vs a dedicated GPS endpoint
- react-zoom-pan-pinch vs CSS transform approach for map zoom/pan
