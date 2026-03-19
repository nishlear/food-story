# GPS Location Research

## Recommendation

Use `navigator.geolocation.watchPosition()` in a custom `useGeolocation` React hook with `enableHighAccuracy: true`. For local dev HTTPS (required for GPS on mobile), use **ngrok** (`ngrok http 3000`) — fastest option, no phone setup needed. For offline/LAN use, **mkcert** is better. The existing `geolocation.py` prototype (setInterval + HTTPS server) can be retired; the browser API handles everything natively.

## Browser Geolocation API

- `watchPosition` is correct for live tracking — fires a callback on every GPS update
- `getCurrentPosition` is one-shot; the prototype's `setInterval + getCurrentPosition` pattern is wasteful and adds latency
- `enableHighAccuracy: true` is **required** to engage the GPS chip (without it, the browser uses cell towers / WiFi → 50–200 m accuracy)
- Typical outdoor GPS accuracy: **3–15 m**. Surface `coords.accuracy` in the UI; ignore or warn when `accuracy > 30 m`
- Returns: `coords.latitude`, `coords.longitude`, `coords.accuracy` (radius in meters)

## HTTPS for Local Dev

GPS is blocked on non-localhost HTTP origins — `192.168.x.x:3000` over plain HTTP will silently fail or throw `PERMISSION_DENIED` on both iOS Safari and Android Chrome.

| Option | Setup | Pros | Cons |
|--------|-------|------|------|
| **ngrok** `ngrok http 3000` | ~1 min | Public HTTPS URL, works everywhere, free tier | Requires internet |
| **mkcert** | ~5 min | LAN-only, works offline | Phone needs to trust the root CA |
| Self-signed cert (like geolocation.py) | ~2 min | No tools needed | Phone shows security warning on every visit |

**Recommendation**: ngrok for demos/testing; mkcert for team dev.

## React Hook Pattern

```typescript
import { useState, useEffect } from 'react';

interface GeolocationState {
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
  error: string | null;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 2000,       // accept cached fix up to 2s old
  timeout: 10000,         // fail after 10s with no fix
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null, lon: null, accuracy: null, error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
        });
      },
      (err) => {
        setState(s => ({ ...s, error: err.message }));
      },
      GEO_OPTIONS,  // defined outside component — avoids restarting effect on every render
    );

    return () => navigator.geolocation.clearWatch(watchId);  // cleanup on unmount
  }, []);

  return state;
}
```

**Key detail**: Define `GEO_OPTIONS` outside the component (or `useMemo`). If inlined, the object reference changes every render and restarts the effect (and the GPS watch).

## Mapping GPS → Pixel Position

Use the same Mercator projection math from `src/map.py`. Given bounding box `(lat_nw, lon_nw)` → `(lat_se, lon_se)` and image dimensions `(imgW, imgH)`:

```typescript
function lonToTileX(lon: number, z: number) {
  return ((lon + 180) / 360) * Math.pow(2, z);
}
function latToTileY(lat: number, z: number) {
  const latRad = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, z);
}

function gpsToPixel(
  lat: number, lon: number,
  latNW: number, lonNW: number,
  latSE: number, lonSE: number,
  imgW: number, imgH: number,
  zoom: number
): { x: number; y: number } | null {
  // Check bounds
  if (lat > latNW || lat < latSE || lon < lonNW || lon > lonSE) return null;

  const xNW = lonToTileX(lonNW, zoom), xSE = lonToTileX(lonSE, zoom);
  const yNW = latToTileY(latNW, zoom), ySE = latToTileY(latSE, zoom);

  const px = ((lonToTileX(lon, zoom) - xNW) / (xSE - xNW)) * imgW;
  const py = ((latToTileY(lat, zoom) - yNW) / (ySE - yNW)) * imgH;

  return { x: px, y: py };
}
```

Returns `null` if the user is outside the street's bounding box (no blue dot shown).

## Accuracy & Edge Cases

- Show blue dot only when `accuracy < 30 m` — otherwise show a "GPS acquiring..." indicator
- Render accuracy circle: `radius = accuracy / metersPerPixel` where `metersPerPixel ≈ 156543 * cos(lat) / 2^zoom`
- iOS requires the page to be in the foreground for continuous GPS updates
- Android Chrome may throttle `watchPosition` in background tabs
- Always call `clearWatch` on unmount to stop GPS drain

## References

- MDN Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- ngrok: https://ngrok.com/
- mkcert: https://github.com/FiloSottile/mkcert
- OSM tile math: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
