# Features Research: Interactive Map + GPS

**Date:** 2026-03-19
**Milestone:** Subsequent — adding map/GPS to existing food street app

## Table Stakes

Features users expect from a "you are here" map on mobile. Missing any of these makes the map feel broken.

| Feature | Notes | Complexity |
|---------|-------|------------|
| Pinch-to-zoom and pan | Mobile map baseline expectation | Low (react-zoom-pan-pinch) |
| Vendor pins visible and tappable | 44px minimum hit area for mobile | Low |
| Tap pin → bottom sheet | Wire to existing VendorBottomSheet component | Low |
| Blue dot at GPS position | Core "you are here" value prop | Medium |
| GPS acquiring indicator | Prevents silent-failure confusion ("why no dot?") | Low |
| GPS permission prompt | Explain WHY before browser asks — improves grant rate | Low |
| Graceful fallback to vendor list | Streets without a map still work | Low |
| Map fills screen without letterboxing | CSS object-fit: contain vs cover decision | Low |
| Map image loads fast | Static PNG — inherently faster than tile loading | Free |

## Differentiators

Nice-to-have features that improve the experience but aren't dealbreakers.

| Feature | Notes | Complexity |
|---------|-------|------------|
| Accuracy circle around blue dot | Semi-transparent ring showing GPS uncertainty radius | Low |
| "You are outside this street" notice | Show when GPS is acquired but user is outside bounds | Low |
| Re-center on me button | Returns map pan to user's blue dot position | Low |
| Color-coded pins by rating | Green/yellow/red pins based on vendor rating | Low |
| Admin tap-to-place pin workflow | With confirmation step — "pin placed here?" before save | Medium |
| Smooth blue dot movement | CSS transition on position update | Low |

## Anti-Features

Explicitly excluded — deliberately NOT building these.

| Feature | Reason |
|---------|--------|
| Turn-by-turn navigation | Wrong scale (vendors are meters apart), routing infrastructure cost |
| Real-time vendor location sharing | Privacy concerns, WebSocket complexity |
| Cluster markers | Zoom 19 with 5–30 vendors — visual scan is sufficient |
| Offline tile caching | Static PNG already solves this cheaply |
| Vendor self-service pin placement | Consistency breaks down without admin control |
| Street view imagery | Out of scope, third-party cost |
| Search/filter on map | 5–30 vendors is visual-scan territory, not a search problem |
| Routing between vendors | Same as navigation |

## Feature Dependencies

```
DB schema (bbox + vendor lat/lon)
  └── Map generation endpoint
        └── Map image stored/served
              └── MapView component (zoom/pan)
                    ├── Vendor pins (lat/lon → pixel)
                    │     └── Tap → VendorBottomSheet
                    └── GPS blue dot (watchPosition → lat/lon → pixel)
                          └── Accuracy circle
                          └── Outside-bounds detection
```

Admin flow dependency:
```
Street has bbox coords
  └── Admin map setup (in EditStreet modal)
        └── Admin tap-to-place vendor pins (pixel → lat/lon → DB)
```

## UX Notes

**Zoom/pan:** Start at fit-to-screen. Allow zoom to 3–4x. Pinch and double-tap to zoom. Pan freely within map bounds. Clamping prevents user from panning into blank space.

**Vendor pin tap targets:** Use a 44×44px touchable area regardless of pin icon size. Stack pin label above icon to avoid finger occlusion.

**Blue dot:** Pulsing animation (CSS keyframes) helps users notice it. Show accuracy circle only when accuracy > 5m (otherwise it's too small to be useful).

**Admin tap-to-place:** After tap, show a preview overlay: "Place vendor here? [Confirm] [Cancel]" — finger covers the exact spot, so show the confirmation slightly above the tap point.

**GPS permission:** Show a custom explanation screen before triggering the browser permission dialog: "To show your location on the map, we need location access." This prevents the cold denial rate from a naked browser prompt.

---
*Research date: 2026-03-19*
