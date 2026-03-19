# Phase 1: Backend Foundation - Research

**Researched:** 2026-03-19
**Domain:** Database schema migration, static map PNG generation, static file serving (Express + FastAPI dual backend)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Map Generation Timing**
- Synchronous — server generates PNG before responding to the street save request
- Admin waits ~1–2 seconds; map is immediately available when response returns
- No background jobs, no polling needed

**Map Regeneration Trigger**
- Regenerate on every street save that includes bbox coords (simplest approach)
- No diff check against previous bbox — always overwrite

**Image Serving**
- Serve as static files at `/maps/{street_id}.png`
- Standard static file serving (cacheable by browser)
- NOT behind an auth-gated API endpoint

**Missing Map Fallback**
- If PNG is missing or generation fails: return `null` for `map_image_path` in street API response
- Frontend treats `null` as "no map" → falls back to existing vendor list UI
- No 500 errors for missing images

**Vendor Coordinate Columns**
- Add new `lat REAL` and `lon REAL` columns to vendors table (nullable)
- Existing `x` and `y` columns stay untouched — they are CSS percentage positions used by the current MapInterface
- Geographic lat/lon always stored in the new columns, never in x/y

**Schema — Streets Table**
- Add to both SQLite (server.ts) and PostgreSQL (main.py):
  - `lat_nw REAL` — NW corner latitude (nullable)
  - `lon_nw REAL` — NW corner longitude (nullable)
  - `lat_se REAL` — SE corner latitude (nullable)
  - `lon_se REAL` — SE corner longitude (nullable)
  - `map_image_path TEXT` — relative path e.g. `maps/1.png` (nullable)
  - `map_zoom INTEGER DEFAULT 19`

### Claude's Discretion
- Express-side map generation approach (Python subprocess vs TypeScript port — planner decides)
- Exact image storage path (`src/frontend/static/maps/` vs `src/static/maps/`)
- Cache-busting strategy for regenerated images

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 1 scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MSET-01 | Admin can add NW and SE lat/lon bounding box coordinates to a street (during create or edit) | Schema migration pattern in server.ts (lines 53–57) and main.py (line 87) directly reusable; bbox fields extend existing POST/PUT /streets endpoints |
| MSET-02 | System generates a static map PNG from OpenStreetMap tiles when a street's bbox is saved | src/map.py contains working prototype with exact math; staticmap 0.5.7 already in pyproject.toml; FastAPI path is straightforward; Express path requires subprocess or port decision |
</phase_requirements>

---

## Summary

Phase 1 is a pure backend change: add bbox columns to the streets table, add lat/lon columns to vendors, run map generation when bbox is saved, and serve the resulting PNG as a static file. Zero visible UI change. All decisions are locked by CONTEXT.md.

The project already has a working map generation prototype (`src/map.py`) using `staticmap 0.5.7`, which is already listed in `pyproject.toml`. The FastAPI path is straightforward — extract the generation logic into a utility function and call it from the existing create/update street endpoints. The Express path requires deciding between calling a Python subprocess or porting the ~10 lines of Mercator math to TypeScript. Given the project uses `tsx` to run the server and that Python is available in the dev environment (used by the same developer), a Python subprocess call is the lowest-effort approach and avoids duplicating math logic.

Both backends use established migration patterns: SQLite uses try/catch `ALTER TABLE ... ADD COLUMN` (server.ts lines 53–57), PostgreSQL uses `text("ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...")` (main.py line 87). There is no test infrastructure in the project; validation will be manual smoke testing of the API endpoints.

**Primary recommendation:** Use `child_process.execFile` in server.ts to call a dedicated generation script, and extract `src/map.py` logic into a reusable utility in `main.py`. Store images at `src/frontend/static/maps/` (Express) and `src/static/maps/` (FastAPI). Use a timestamp query param for cache busting.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| staticmap | 0.5.7 | Fetch OSM tiles and stitch into PNG | Already in pyproject.toml; proven working in src/map.py |
| better-sqlite3 | 12.4.1 | SQLite for Express dev server | Already in package.json; sync API matches server.ts patterns |
| SQLAlchemy | (in venv) | ORM + migrations for FastAPI/PostgreSQL | Already used throughout main.py |
| FastAPI StaticFiles | bundled | Mount `src/static/maps/` as `/maps` endpoint | Pattern already in src/geolocation.py |
| Node.js child_process | built-in | Call Python map generation from Express | No new dependency; acceptable for dev-only server |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| os.makedirs (Python stdlib) | built-in | Create `static/maps/` directory on startup | Prevents silent failure on first Docker run (P12) |
| fs.mkdirSync (Node.js stdlib) | built-in | Create `static/maps/` directory on startup | Same for Express dev server |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Python subprocess from Express | TypeScript port of Mercator math | Port avoids subprocess overhead and Python dependency in Node process; but adds ~40 lines of math code to maintain in two languages. Subprocess wins for Phase 1 since keeping a single source of truth is worth the small overhead. |
| File-based static serving | DB blob storage | DB blobs avoid filesystem state management but add complexity for what is ~1–5 images. File-based serving is simpler. |

**Installation:**
```bash
# Python — staticmap already present
uv sync

# Node — no new dependencies needed
cd src/frontend && npm install  # nothing new
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── backend/
│   ├── main.py               # extend: add bbox columns, map gen, StaticFiles mount
│   └── map_utils.py          # NEW: extract map generation logic from src/map.py
├── frontend/
│   ├── server.ts             # extend: add bbox columns, map gen via subprocess
│   └── static/
│       └── maps/             # NEW: generated PNG storage for Express dev
└── static/
    └── maps/                 # NEW: generated PNG storage for FastAPI/Docker
```

### Pattern 1: SQLite Column Migration (server.ts)

**What:** Wrap each `ALTER TABLE ... ADD COLUMN` in an individual try/catch so that second-run on existing DBs is silent.
**When to use:** Every time a new column is added after initial schema creation.

```typescript
// Source: server.ts lines 53–57 (existing pattern)
try {
  db.exec('ALTER TABLE streets ADD COLUMN lat_nw REAL');
} catch {
  // Column already exists
}
// Repeat for each new column individually
```

Each column gets its own try/catch block. Do not batch multiple columns in one try/catch — if the first column already exists, the second won't be added.

### Pattern 2: PostgreSQL Column Migration (main.py)

**What:** Use `ADD COLUMN IF NOT EXISTS` so repeated app starts are idempotent.
**When to use:** All FastAPI column additions.

```python
# Source: main.py lines 85–89 (existing pattern)
with engine.connect() as _conn:
    _conn.execute(text(
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lat_nw FLOAT"
    ))
    _conn.execute(text(
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lon_nw FLOAT"
    ))
    # ... additional columns
    _conn.commit()
```

Note: PostgreSQL uses `FLOAT` or `DOUBLE PRECISION`, not `REAL` — though `REAL` is valid SQL, using `FLOAT` matches SQLAlchemy's `Column(Float, ...)` type.

### Pattern 3: SQLAlchemy Model Extension

**What:** Add new columns to existing ORM models; SQLAlchemy's `create_all` skips existing tables, so the manual ALTER TABLE migration above must run first.
**When to use:** Any time schema changes happen on a live deployment.

```python
# Source: main.py FoodStreet model (extend existing)
class FoodStreet(Base):
    __tablename__ = "food_streets"
    # ... existing columns ...
    lat_nw = Column(Float, nullable=True)
    lon_nw = Column(Float, nullable=True)
    lat_se = Column(Float, nullable=True)
    lon_se = Column(Float, nullable=True)
    map_image_path = Column(Text, nullable=True)
    map_zoom = Column(Integer, default=19)
```

### Pattern 4: FastAPI StaticFiles Mount

**What:** Mount a filesystem directory as a static file URL prefix.
**When to use:** Serving generated map PNGs from FastAPI.

```python
# Source: src/geolocation.py lines 11–13 (existing pattern in project)
from fastapi.staticfiles import StaticFiles
import os

maps_dir = os.path.join(os.path.dirname(__file__), "..", "static", "maps")
os.makedirs(maps_dir, exist_ok=True)
app.mount("/maps", StaticFiles(directory=maps_dir), name="maps")
```

The mount must be registered before route definitions to avoid conflicts. Path: `src/static/maps/` relative to the project root.

### Pattern 5: Express Static File Serving

**What:** Serve a directory of static files from Express.
**When to use:** Serving generated map PNGs from the Express dev server.

```typescript
// Source: Express docs / standard pattern
import fs from 'fs';
import path from 'path';

const mapsDir = path.join(process.cwd(), 'static', 'maps');
fs.mkdirSync(mapsDir, { recursive: true });
app.use('/maps', express.static(mapsDir));
```

Place before the Vite middleware block so static file requests don't fall through to the SPA handler.

### Pattern 6: Map Generation — FastAPI

**What:** Extract map.py logic into a reusable function, call from street endpoints.

```python
# Source: src/map.py (existing prototype — extract to map_utils.py)
import math
import os
from staticmap import StaticMap

def generate_map_png(lat_nw: float, lon_nw: float, lat_se: float, lon_se: float,
                     zoom: int, output_path: str) -> bool:
    """Returns True on success, False on failure. Never raises."""
    try:
        def lon_to_tile_x(lon, z):
            return (lon + 180) / 360 * 2**z
        def lat_to_tile_y(lat, z):
            lat_rad = math.radians(lat)
            return (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * 2**z

        width  = round((lon_to_tile_x(lon_se, zoom) - lon_to_tile_x(lon_nw, zoom)) * 256)
        height = round((lat_to_tile_y(lat_se, zoom) - lat_to_tile_y(lat_nw, zoom)) * 256)
        # Cap to prevent giant images (P11)
        width  = min(width,  2048)
        height = min(height, 2048)

        center_lat = (lat_nw + lat_se) / 2
        center_lon = (lon_nw + lon_se) / 2

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        m = StaticMap(width, height, url_template='https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        image = m.render(zoom=zoom, center=[center_lon, center_lat])
        image.save(output_path)
        return True
    except Exception:
        return False
```

### Pattern 7: Map Generation — Express (Python subprocess)

**What:** Call the Python generation logic from Node.js via execFile.
**When to use:** Express dev server (only) — FastAPI handles this natively.

```typescript
// Source: Node.js child_process docs
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

async function generateMapPng(
  latNw: number, lonNw: number, latSe: number, lonSe: number,
  zoom: number, outputPath: string
): Promise<boolean> {
  try {
    await execFileAsync('python3', [
      'src/backend/gen_map.py',  // dedicated generation script
      String(latNw), String(lonNw), String(latSe), String(lonSe),
      String(zoom), outputPath
    ]);
    return true;
  } catch {
    return false;
  }
}
```

A dedicated `src/backend/gen_map.py` script accepts args via `sys.argv` and calls the same generation logic. This avoids duplicating math in TypeScript.

### Pattern 8: Pydantic Schema Extension (main.py)

**What:** Add optional bbox fields and `map_image_path` to existing Pydantic models.

```python
# Source: main.py FoodStreetBase / FoodStreetResponse (extend)
class FoodStreetBase(BaseModel):
    name: str
    city: str
    description: Optional[str] = None
    lat_nw: Optional[float] = None
    lon_nw: Optional[float] = None
    lat_se: Optional[float] = None
    lon_se: Optional[float] = None
    map_zoom: int = 19

class FoodStreetResponse(FoodStreetBase):
    id: str
    vendors_count: int = 0
    map_image_path: Optional[str] = None

    class Config:
        from_attributes = True
```

Note: `map_image_path` is on the Response model (read-only from client perspective) and set by the server after generating the PNG.

### Anti-Patterns to Avoid

- **Batching multiple ALTER TABLE columns in one try/catch (SQLite):** If column A already exists, the entire block fails and column B is never added. Each ALTER TABLE must be in its own try/catch.
- **Storing image path as absolute filesystem path:** Store relative paths like `maps/3.png`; the URL prefix is added at serve time. Absolute paths break across environments.
- **Placing StaticFiles mount after route definitions in FastAPI:** FastAPI routes and mounts are matched in order. Mount `/maps` before any catch-all routes.
- **Not creating the maps directory on startup:** The first PNG save fails if the directory doesn't exist. Always `os.makedirs(..., exist_ok=True)` and `fs.mkdirSync(..., { recursive: true })` at server startup.
- **Generating map inside the HTTP request without error handling:** A tile fetch timeout or network error must not return 500. Wrap generation in try/except and return `null` for `map_image_path` on failure.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OSM tile fetching and stitching | Custom tile download + PIL compositing | staticmap 0.5.7 | Handles tile coordinates, HTTP with retries, image stitching; already in pyproject.toml |
| Mercator projection math | Custom lat/lon → pixel formula | src/map.py (existing, verified) | The existing formulas are correct; reuse them |
| Static file serving middleware | Manual file read + response | express.static() / FastAPI StaticFiles | Both handle ETags, range requests, content-type |

**Key insight:** The entire generation pipeline already exists in `src/map.py`. This phase is mostly plumbing — connecting that logic to the database write path.

---

## Common Pitfalls

### Pitfall 1: Each SQLite ALTER TABLE must be in its own try/catch

**What goes wrong:** Batching `ALTER TABLE streets ADD COLUMN lat_nw REAL; ALTER TABLE streets ADD COLUMN lon_nw REAL` in one `db.exec()` call inside a single try/catch means that if any column already exists (e.g., on app restart), the entire batch is skipped and subsequent columns are not added.
**Why it happens:** SQLite has no `IF NOT EXISTS` for `ADD COLUMN`; the error is thrown on the first duplicate.
**How to avoid:** One `db.exec('ALTER TABLE ... ADD COLUMN ...')` per try/catch block.
**Warning signs:** Some columns exist, others missing after restart; original server.ts lines 53–57 shows the correct single-column pattern.

### Pitfall 2: Maps directory not created before first write

**What goes wrong:** `image.save("src/static/maps/3.png")` raises `FileNotFoundError` if `src/static/maps/` doesn't exist. The error is swallowed if generation is in a try/except, causing `map_image_path` to silently return `null`.
**Why it happens:** Docker containers start fresh with no local filesystem state.
**How to avoid:** Call `os.makedirs(maps_dir, exist_ok=True)` at FastAPI startup (before any request). Call `fs.mkdirSync(mapsDir, { recursive: true })` in server.ts at startup.
**Warning signs:** Map generation always returns `null` on first Docker run; works fine after manual `mkdir`.

### Pitfall 3: Forgetting to update the parallel backend

**What goes wrong:** street save works in dev (Express/SQLite) but returns 404 or old schema in production (FastAPI/PostgreSQL).
**Why it happens:** Two servers serve the same route surface — any change to server.ts must be mirrored in main.py.
**How to avoid:** Treat server.ts and main.py as a synchronized pair. After each route change, immediately update the counterpart. (Pitfall P13 from PITFALLS.md)
**Warning signs:** Works on `npm run dev`, breaks on `docker-compose up`.

### Pitfall 4: Map generation network timeout blocks the request

**What goes wrong:** OSM tile server is slow or unavailable; the synchronous map generation hangs the street save for 30+ seconds.
**Why it happens:** staticmap fetches tiles over HTTP with no explicit timeout in the default configuration.
**How to avoid:** Set a reasonable timeout in the generate function. Wrap the entire generation in try/except with a fallback to `null`. Consider OS-level request timeout if needed.
**Warning signs:** Street saves occasionally hang on slow networks.

### Pitfall 5: image path stored as URL instead of relative path

**What goes wrong:** If `map_image_path` is stored as `/maps/3.png` (absolute URL path), Phase 2 frontend code will use it directly as `<img src={street.map_image_path}>`, which works. But if it is stored as a full URL like `http://localhost:3000/maps/3.png`, it breaks across environments.
**Why it happens:** Temptation to store the final URL for convenience.
**How to avoid:** Store only the relative path: `maps/3.png` or `maps/{street_id}.png`. The frontend or serve layer adds the prefix. CONTEXT.md decision says `maps/1.png` format.
**Warning signs:** Images load in dev, break in Docker or production.

### Pitfall 6: Cache-busting not addressed for regenerated maps (P10)

**What goes wrong:** Admin updates bbox; server regenerates `maps/3.png`; browser shows old cached image because URL is unchanged.
**Why it happens:** Browser aggressively caches static files, especially when served with no cache-control headers.
**How to avoid:** Store `map_updated_at` timestamp in the streets table (or reuse a simple integer counter). Return the timestamp in the API response. Frontend (Phase 2) constructs `<img src={'/maps/' + street.id + '.png?v=' + street.map_updated_at}>`.
**Warning signs:** Admin updates bbox, saves, and the old map still appears.

---

## Code Examples

### SQLite migration for new streets columns

```typescript
// server.ts — each column in its own try/catch (mirrors existing pattern at line 53–57)
const newStreetColumns = [
  'ALTER TABLE streets ADD COLUMN lat_nw REAL',
  'ALTER TABLE streets ADD COLUMN lon_nw REAL',
  'ALTER TABLE streets ADD COLUMN lat_se REAL',
  'ALTER TABLE streets ADD COLUMN lon_se REAL',
  'ALTER TABLE streets ADD COLUMN map_image_path TEXT',
  'ALTER TABLE streets ADD COLUMN map_zoom INTEGER DEFAULT 19',
];
for (const sql of newStreetColumns) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

const newVendorColumns = [
  'ALTER TABLE vendors ADD COLUMN lat REAL',
  'ALTER TABLE vendors ADD COLUMN lon REAL',
];
for (const sql of newVendorColumns) {
  try { db.exec(sql); } catch { /* column already exists */ }
}
```

### PostgreSQL migration for new streets columns

```python
# main.py — inside the existing `with engine.connect() as _conn:` block (line 85)
for col_sql in [
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lat_nw FLOAT",
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lon_nw FLOAT",
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lat_se FLOAT",
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lon_se FLOAT",
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS map_image_path TEXT",
    "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 19",
    "ALTER TABLE food_vendors ADD COLUMN IF NOT EXISTS lat FLOAT",
    "ALTER TABLE food_vendors ADD COLUMN IF NOT EXISTS lon FLOAT",
]:
    _conn.execute(text(col_sql))
_conn.commit()
```

### Extend POST /api/streets to accept and persist bbox (server.ts excerpt)

```typescript
// server.ts — extend existing POST /api/streets handler
app.post('/api/streets', async (req, res) => {
  if (getRoleFromRequest(req) !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id, name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom = 19 } = req.body;

  db.prepare(
    'INSERT INTO streets (id, name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, name, city, description, lat_nw ?? null, lon_nw ?? null, lat_se ?? null, lon_se ?? null, map_zoom);

  let map_image_path: string | null = null;
  if (lat_nw != null && lon_nw != null && lat_se != null && lon_se != null) {
    const outputPath = path.join(process.cwd(), 'static', 'maps', `${id}.png`);
    const success = await generateMapPng(lat_nw, lon_nw, lat_se, lon_se, map_zoom, outputPath);
    if (success) {
      map_image_path = `maps/${id}.png`;
      db.prepare('UPDATE streets SET map_image_path = ? WHERE id = ?').run(map_image_path, id);
    }
  }

  res.json({ success: true });
});
```

### gen_map.py — standalone script called by Express subprocess

```python
#!/usr/bin/env python3
# src/backend/gen_map.py — called by Express via child_process.execFile
# Usage: python3 gen_map.py <lat_nw> <lon_nw> <lat_se> <lon_se> <zoom> <output_path>
import sys
import math
import os
from staticmap import StaticMap

def main():
    lat_nw, lon_nw, lat_se, lon_se = (float(x) for x in sys.argv[1:5])
    zoom = int(sys.argv[5])
    output_path = sys.argv[6]

    def lon_to_tile_x(lon, z): return (lon + 180) / 360 * 2**z
    def lat_to_tile_y(lat, z):
        lr = math.radians(lat)
        return (1 - math.log(math.tan(lr) + 1 / math.cos(lr)) / math.pi) / 2 * 2**z

    width  = min(round((lon_to_tile_x(lon_se, zoom) - lon_to_tile_x(lon_nw, zoom)) * 256), 2048)
    height = min(round((lat_to_tile_y(lat_se, zoom) - lat_to_tile_y(lat_nw, zoom)) * 256), 2048)
    center_lat = (lat_nw + lat_se) / 2
    center_lon = (lon_nw + lon_se) / 2

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    m = StaticMap(width, height, url_template='https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    image = m.render(zoom=zoom, center=[center_lon, center_lat])
    image.save(output_path)

if __name__ == '__main__':
    main()
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tile-based map (Leaflet/Mapbox) | Static PNG from staticmap | Project decision | Simpler, no client JS map library, offline-capable after initial load |
| Pixel-based vendor positions (x/y %) | lat/lon geographic coordinates | Project decision | Pins correct regardless of image display size |

---

## Discretion Recommendations

### Express-side map generation: Python subprocess

**Recommendation:** Use `child_process.execFile` calling a dedicated `src/backend/gen_map.py` script.

**Rationale:**
- Keeps the Mercator math in one language (Python), avoiding divergence bugs
- The Express server is dev-only; subprocess overhead (100–300ms) is acceptable
- `src/map.py` is already the proven working prototype; a thin script wrapper is low risk
- TypeScript port would be ~40 lines of math that then needs to stay in sync with the Python version as Phase 2 evolves

**Implementation:** Create `src/backend/gen_map.py` that accepts args via `sys.argv`. Express calls it via `execFileAsync('python3', ['src/backend/gen_map.py', ...args])`.

### Exact image storage path

**Recommendation:**
- Express dev: `src/frontend/static/maps/{id}.png`, served at `/maps/{id}.png` via `express.static()`
- FastAPI Docker: `src/static/maps/{id}.png`, served at `/maps/{id}.png` via `StaticFiles`

**Rationale:** These paths keep each server's static directory self-contained. The CONTEXT.md canonical refs mention `src/frontend/static/maps/` for Express and `src/static/maps/` for FastAPI. The `src/static/` directory already exists (contains `map.png`, `script.js`, `index.html` from the GPS prototype).

### Cache-busting strategy

**Recommendation:** Add a `map_updated_at TEXT` column to the streets table. Set it to `new Date().toISOString()` on each successful map generation. Return it in the street API response as `map_updated_at`. Phase 2 frontend appends `?v=<map_updated_at>` to the image URL.

**Rationale:** Simple, no extra complexity. The timestamp is naturally available at generation time. Storing it in the DB means it survives server restarts.

---

## Open Questions

1. **SQLAlchemy model sync**
   - What we know: `Base.metadata.create_all(bind=engine)` (main.py line 91) does NOT add columns to existing tables — only the manual `ALTER TABLE` migrations do
   - What's unclear: Whether the ORM model column declarations are needed at all if manual SQL is used everywhere
   - Recommendation: Add columns to the SQLAlchemy model AND run the manual ALTER TABLE migrations. The model declarations are needed for `db_street.lat_nw` attribute access in route handlers.

2. **staticmap tile rate limiting**
   - What we know: OSM tile usage policy requires identifying the application in the User-Agent and rate limits heavy users
   - What's unclear: Whether staticmap 0.5.7 sets a compliant User-Agent by default
   - Recommendation: This is a development project with infrequent map generations (admin-only, per street save). Rate limiting is not a practical concern. Document it as a production consideration.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no test infrastructure exists in the project |
| Config file | None — Wave 0 must create if needed |
| Quick run command | `curl` smoke tests against running server (manual) |
| Full suite command | N/A |

No pytest, jest, or vitest configuration exists. No test files in the project tree. Given `nyquist_validation: true` in config, the planner should include explicit smoke test steps (curl commands) in each plan task rather than automated test files, unless Wave 0 creates test infrastructure.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MSET-01 | POST /api/streets with bbox fields persists lat_nw, lon_nw, lat_se, lon_se | smoke | `curl -s -X POST .../api/streets -H 'X-Role-Token: ...' -d '{...bbox...}'` | ❌ Wave 0 |
| MSET-01 | GET /api/streets response includes lat_nw, lon_nw, lat_se, lon_se, map_image_path | smoke | `curl -s .../api/streets -H 'X-Role-Token: ...'` | ❌ Wave 0 |
| MSET-02 | Street with bbox → PNG file created at static/maps/{id}.png | smoke | `ls src/frontend/static/maps/ && ls src/static/maps/` after POST/PUT | ❌ Wave 0 |
| MSET-02 | Street without bbox → map_image_path is null, no PNG generated | smoke | GET /api/streets for a no-bbox street; confirm null | ❌ Wave 0 |
| MSET-02 | Both server.ts and main.py return consistent response shape | smoke | Run same curl against both servers | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Verify affected endpoints return expected fields (manual curl)
- **Per wave merge:** Full smoke test of all street CRUD routes (manual)
- **Phase gate:** All smoke tests pass on both Express and FastAPI before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/backend/gen_map.py` — dedicated generation script for subprocess calls from Express
- [ ] `src/frontend/static/maps/` directory — must exist before first map generation
- [ ] `src/static/maps/` directory — must exist before first Docker map generation
- [ ] Smoke test token: confirm base64 of `admin:admin` = `YWRtaW46YWRtaW4=`

---

## Sources

### Primary (HIGH confidence)

- `src/map.py` — working map generation prototype with verified Mercator math
- `src/frontend/server.ts` — established migration pattern (lines 53–57), existing street/vendor routes
- `src/backend/main.py` — established migration pattern (line 87), SQLAlchemy models, existing street/vendor routes
- `src/geolocation.py` — FastAPI StaticFiles mount pattern (lines 11–13)
- `.planning/research/ARCHITECTURE.md` — DB schema design, image storage paths, build order
- `.planning/research/PITFALLS.md` — P10–P14 directly applicable to this phase
- `.planning/phases/01-backend-foundation/01-CONTEXT.md` — locked implementation decisions
- `pyproject.toml` — confirms staticmap 0.5.7 already present

### Secondary (MEDIUM confidence)

- Node.js `child_process.execFile` + `promisify` — standard Node.js pattern for subprocess calls; widely documented
- FastAPI `StaticFiles` mounting order requirement — standard FastAPI behavior per docs

### Tertiary (LOW confidence)

- staticmap 0.5.7 default User-Agent for OSM tile requests — not verified; production concern only

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use or in pyproject.toml; no new dependencies needed
- Architecture: HIGH — patterns extracted directly from existing code in the repository
- Pitfalls: HIGH — P10–P14 come from project's own PITFALLS.md research; confirmed against code

**Research date:** 2026-03-19
**Valid until:** 2026-04-18 (stable tech, 30 days)
