---
phase: 01-backend-foundation
verified: 2026-03-19T11:35:00Z
status: passed
score: 8/8 must-haves verified
re_verification: false
---

# Phase 1: Backend Foundation Verification Report

**Phase Goal:** The system can store bounding boxes, generate static map PNGs from OSM tiles, and serve them to the frontend — with no regressions on existing street/vendor flows
**Verified:** 2026-03-19T11:35:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                          | Status     | Evidence                                                                                              |
|----|------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------|
| 1  | Streets table has lat_nw, lon_nw, lat_se, lon_se, map_image_path, map_zoom, map_updated_at columns in both SQLite and PostgreSQL | VERIFIED | server.ts lines 65-76: 7 ALTER TABLE migrations; main.py lines 99-110: matching IF NOT EXISTS migrations |
| 2  | Vendors table has lat and lon columns in both SQLite and PostgreSQL                           | VERIFIED | server.ts lines 79-85; main.py lines 107-108 and FoodVendor model lines 64-65                         |
| 3  | POST/PUT /streets accepts bbox fields and persists them                                        | VERIFIED | server.ts POST line 203: destructures all bbox fields, INSERT includes all 9 columns; PUT line 224: same pattern, UPDATE sets all 8 fields |
| 4  | GET /streets returns bbox fields and map_image_path in response                                | VERIFIED | server.ts line 192: SELECT * + spread at line 195 includes all new columns automatically; main.py list_streets lines 415-430 explicitly includes all bbox and map fields |
| 5  | When a street is saved with bbox coords, a PNG map image is generated and stored on disk       | VERIFIED | server.ts lines 209-216: guards on all 4 coords, calls generateMapPng, updates map_image_path on success; main.py lines 455-464 and 521-530: same pattern in create_street and update_street |
| 6  | When a street has no bbox, map_image_path is null and no PNG is generated                     | VERIFIED | server.ts: bbox guard `if (lat_nw != null && lon_nw != null && lat_se != null && lon_se != null)` ensures no-op for null coords; map_image_path defaults to null |
| 7  | Generated map PNGs are accessible at /maps/{id}.png as static files                           | VERIFIED | server.ts line 419: `app.use('/maps', express.static(mapsDir))`; main.py line 291: `app.mount("/maps", StaticFiles(directory=_maps_dir), name="maps")`; map_image_path stored as `maps/{id}.png` (relative URL prefix) |
| 8  | Streets without bbox continue to work with no regressions                                     | VERIFIED | All new columns are nullable; existing route shapes unchanged; Vite build passes clean (1.35s, 0 errors) |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact                      | Provides                                                              | Status    | Details                                                                                    |
|-------------------------------|-----------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------|
| `src/frontend/server.ts`      | Express schema migrations, bbox in street CRUD, static /maps serving, subprocess map gen | VERIFIED  | Contains `lat_nw` at lines 66, 203, 224; mapsDir + static mount at lines 417-419; generateMapPng at lines 432-446 |
| `src/backend/main.py`         | FastAPI schema migrations, bbox in street CRUD, StaticFiles /maps mount, inline map gen  | VERIFIED  | Contains `lat_nw` at lines 37, 100, 151; StaticFiles mount at line 291; generate_map_png calls at lines 458, 524 |
| `src/backend/gen_map.py`      | Standalone map generation script for Express subprocess calls         | VERIFIED  | 28 lines; contains `from map_utils import generate_map_png`; `sys.exit(0 if success else 1)` at line 24; tested standalone — produces valid 245 KB PNG |
| `src/backend/map_utils.py`    | Reusable map generation function for FastAPI                          | VERIFIED  | Contains `def generate_map_png(` at line 6; `from staticmap import StaticMap` at line 3; `min(max(width, 1), 2048)` at lines 21-22 |

### Key Link Verification

| From                         | To                           | Via                                             | Status     | Details                                                                                                   |
|------------------------------|------------------------------|-------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------|
| `src/frontend/server.ts`     | `src/backend/gen_map.py`     | `execFileAsync(pythonExe, ['...gen_map.py', ...])` | WIRED  | server.ts line 438: uses `pythonExe` (uv venv python3 at project root `.venv/bin/python3`, verified to exist) + path to gen_map.py; fallback to system python3 |
| `src/backend/main.py`        | `src/backend/map_utils.py`   | `from map_utils import generate_map_png`        | WIRED      | main.py line 293: direct import; generate_map_png called at lines 458 and 524                             |
| `src/frontend/server.ts`     | `src/frontend/static/maps/`  | `express.static` at `/maps`                     | WIRED      | server.ts lines 417-419: `mapsDir` created with `mkdirSync` at startup; `app.use('/maps', express.static(mapsDir))` registered before Vite middleware |
| `src/backend/main.py`        | `src/static/maps/`           | FastAPI StaticFiles mount at `/maps`            | WIRED      | main.py lines 289-291: `_maps_dir` created with `os.makedirs`; `app.mount("/maps", StaticFiles(...))` at line 291 |

**Note on maps directories:** Both `src/frontend/static/maps/` and `src/static/maps/` are created at server runtime (not committed to git). This is correct — `mkdirSync` and `os.makedirs(exist_ok=True)` run on process startup. The directories were not present in the working tree at verification time, which is expected for a fresh checkout.

### Requirements Coverage

| Requirement | Source Plan | Description                                                              | Status    | Evidence                                                                                            |
|-------------|-------------|--------------------------------------------------------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| MSET-01     | 01-01-PLAN  | Admin can add NW and SE lat/lon bounding box coordinates to a street (during create or edit) | SATISFIED | POST/PUT /streets in both backends accept lat_nw, lon_nw, lat_se, lon_se, map_zoom and persist them; nullable columns allow edit without requiring bbox |
| MSET-02     | 01-01-PLAN  | System generates a static map PNG from OpenStreetMap tiles when a street's bbox is saved | SATISFIED | Both backends trigger map generation synchronously on create/update when all 4 bbox coords are non-null; gen_map.py confirmed to produce valid PNG from OSM tiles |

No orphaned requirements: REQUIREMENTS.md Traceability table maps only MSET-01 and MSET-02 to Phase 1.

### Anti-Patterns Found

No anti-patterns detected in any of the four modified/created files. No TODO/FIXME/PLACEHOLDER comments, no empty handler stubs, no return null implementations.

### Human Verification Required

#### 1. Map generation under Express subprocess

**Test:** Start `npm run dev` in `src/frontend`, log in as admin, create a street with valid bbox coordinates (e.g., lat_nw=10.718668, lon_nw=106.604159, lat_se=10.716327, lon_se=106.610490). Check that `src/frontend/static/maps/{id}.png` exists and `GET /api/streets` returns a non-null `map_image_path`.
**Expected:** PNG file created on disk; response includes `map_image_path: "maps/{id}.png"`.
**Why human:** Cannot verify the full Express subprocess invocation (venv python detection + child_process.execFile) without running the live server. The `gen_map.py` standalone test passed, but the subprocess wiring through server.ts has not been exercised end-to-end.

#### 2. Static file serving reachable in browser

**Test:** With dev server running and a street that has a map, navigate to `http://localhost:3000/maps/{id}.png` in a browser.
**Expected:** PNG image renders in browser (not 404).
**Why human:** Static file mount is before Vite middleware in code, but live request routing cannot be verified statically.

### Gaps Summary

None. All 8 observable truths verified. Both requirements satisfied with full implementation evidence.

---

## Commit Verification

Documented commit `28f1f22` verified to exist in git history with matching description: "feat(01-01): schema migrations, bbox in street CRUD, map gen utilities"

## Build Verification

`npm run build` in `src/frontend`: exit 0, 2091 modules transformed, no TypeScript errors.

## Standalone Tool Verification

`uv run python3 src/backend/gen_map.py 10.718668 106.604159 10.716327 106.610490 19 /tmp/test_map_verify.png`: exit 0, produced 245,390-byte PNG.

---

_Verified: 2026-03-19T11:35:00Z_
_Verifier: Claude (gsd-verifier)_
