# Codebase Structure

**Analysis Date:** 2026-03-18

## Directory Layout

```
food-story/
├── .planning/
│   └── codebase/                    # GSD codebase mapping (this directory)
├── docs/                            # Project documentation
├── src/
│   ├── backend/
│   │   ├── main.py                  # FastAPI server (Docker deployment)
│   │   ├── Dockerfile               # FastAPI container image
│   │   └── __pycache__/             # Python compiled files (gitignored)
│   ├── frontend/
│   │   ├── server.ts                # Express dev server (local dev only)
│   │   ├── package.json             # npm dependencies
│   │   ├── vite.config.ts           # Vite build config
│   │   ├── tsconfig.json            # TypeScript config
│   │   ├── tailwind.config.js        # Tailwind CSS config
│   │   ├── nginx.conf               # nginx reverse proxy (Docker)
│   │   ├── Dockerfile               # Frontend container image
│   │   ├── src/
│   │   │   ├── main.tsx             # React app entry point
│   │   │   ├── App.tsx              # Root component (state + screens)
│   │   │   ├── types.ts             # TypeScript interfaces (CurrentUser, etc.)
│   │   │   ├── components/          # UI components (one per file)
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── LocationSelection.tsx
│   │   │   │   ├── MapInterface.tsx
│   │   │   │   ├── AdminScreen.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminUsersTab.tsx
│   │   │   │   ├── AdminVendorsTab.tsx
│   │   │   │   ├── AdminCommentsTab.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── VendorBottomSheet.tsx
│   │   │   │   ├── AddLocationModal.tsx
│   │   │   │   ├── EditLocationModal.tsx
│   │   │   │   ├── DeleteLocationModal.tsx
│   │   │   │   ├── AddVendorModal.tsx
│   │   │   │   ├── VendorEditModal.tsx
│   │   │   │   ├── VendorRateForm.tsx
│   │   │   │   ├── VendorCommentsList.tsx
│   │   │   │   ├── ChangePasswordModal.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   └── index.html           # HTML root (Vite)
│   │   ├── dist/                    # Vite build output (gitignored)
│   │   ├── app.db                   # SQLite database (local dev, gitignored)
│   │   └── node_modules/            # npm packages (gitignored)
│   ├── static/                      # Prototype/prototype utilities
│   ├── geolocation.py               # GPS prototype (standalone)
│   └── map.py                       # Map visualization prototype (standalone)
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Docker Compose services definition
├── CLAUDE.md                         # Claude Code instructions
├── README.md                         # Project documentation
├── Dockerfile                        # Root Dockerfile (backend)
├── requirements.txt                  # Python dependencies
├── pyproject.toml                    # Python project metadata
└── uv.lock                           # uv package manager lockfile
```

## Directory Purposes

**`src/backend/`:**
- Purpose: FastAPI server implementation for Docker deployment
- Contains: Python FastAPI app with SQLAlchemy ORM, Pydantic schemas, auth dependencies
- Key files: `main.py` (all endpoints, models, schemas); `Dockerfile` (Python 3.11 base)

**`src/frontend/`:**
- Purpose: React frontend + Express dev server
- Contains: Vite build config, React components, Tailwind styling, Express routes (local dev only)
- Key files: `server.ts` (dev server), `package.json` (npm deps), `src/` (React code), `nginx.conf` (Docker reverse proxy)

**`src/frontend/src/`:**
- Purpose: React application source code
- Contains: Entry point, root component, type definitions, UI components
- Key files: `main.tsx` (mounts React), `App.tsx` (state + routing), `types.ts` (interfaces), `components/` (all UI)

**`src/frontend/src/components/`:**
- Purpose: Reusable UI components (one file per component)
- Contains: Screen components (LoginScreen, LocationSelection, MapInterface, AdminScreen), modals (AddLocationModal, EditLocationModal, AddVendorModal, SettingsModal), forms (RegisterForm, VendorRateForm), sheets (VendorBottomSheet)
- Naming: PascalCase (e.g., `AddVendorModal.tsx`), each file exports single React component as default

**`src/static/`:**
- Purpose: Standalone prototypes (GPS, map visualization) not integrated into main app
- Contains: Experimental scripts, utility functions

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md)
- Contains: Auto-generated or manually updated reference docs for future Claude instances

## Key File Locations

**Entry Points:**
- `src/frontend/src/main.tsx`: Mounts React app to DOM element
- `src/frontend/src/App.tsx`: Root component; manages app-wide state (currentUser, currentScreen, locations, vendors)
- `src/frontend/server.ts`: Express server (local dev) on port 3000; implements `/api/*` routes
- `src/backend/main.py`: FastAPI server (Docker) on port 8000; implements `/api/*` routes

**Configuration:**
- `src/frontend/vite.config.ts`: Vite build & dev settings (HMR, Tailwind plugin)
- `src/frontend/tsconfig.json`: TypeScript compiler options
- `src/frontend/tailwind.config.js`: Tailwind CSS theme + plugins
- `src/frontend/package.json`: npm dependencies (React, Vite, Express, TailwindCSS, Lucide icons)
- `src/backend/main.py` (lines 14-21): Database engine setup; `DATABASE_URL` env var controls SQLite vs PostgreSQL

**Core Logic:**
- `src/frontend/src/App.tsx`: State management + screen transitions + API calls
- `src/frontend/server.ts`: Auth endpoints (login, register, change-password), CRUD endpoints for streets/vendors/comments, admin endpoints
- `src/backend/main.py`: Identical API surface to `server.ts` using FastAPI + SQLAlchemy

**Type Definitions:**
- `src/frontend/src/types.ts`: `CurrentUser`, `UserRole`, `Comment`, `User`, `AdminStats` interfaces

**Testing:**
- Not present in codebase (PoC stage); no test framework configured

## Naming Conventions

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `LoginScreen.tsx`, `AddVendorModal.tsx`)
- Utilities/helpers: camelCase (e.g., `authHeaders()` function in `App.tsx`)
- Database tables: Snake_case in Express (`streets`, `vendors`, `users`, `comments`); PascalCase in FastAPI models (`FoodStreet`, `FoodVendor`, `AppUser`, `FoodComment`)

**Directories:**
- Lowercase (e.g., `src/`, `frontend/`, `backend/`, `components/`)
- Plural for collections (e.g., `src/frontend/src/components/`)

**TypeScript/JavaScript:**
- Variables & functions: camelCase (e.g., `currentUser`, `handleLogin`, `setSelectedVendor`)
- Types/interfaces: PascalCase (e.g., `CurrentUser`, `UserRole`)
- Constants: UPPER_SNAKE_CASE if exported; camelCase otherwise

**Database:**
- Table names: lowercase plural (Express) or PascalCase model class (FastAPI)
- Columns: snake_case (e.g., `owner_username`, `created_at`)
- IDs: String (UUID or custom string); primary key = `id`

**API Routes:**
- Kebab-case for endpoints (e.g., `/api/auth/login`, `/api/admin/stats`)
- Resource plurals: `/streets`, `/vendors`, `/comments`, `/users`
- Nested resources: `/streets/:id/vendors`, `/vendors/:vendorId/comments`
- Admin routes: `/admin/` prefix (e.g., `/admin/stats`, `/admin/users`, `/admin/vendors`)

## Where to Add New Code

**New Feature (e.g., new CRUD resource):**
1. **Database schema:** Add table to Express `db.exec()` block in `server.ts` (line 13-50) AND to FastAPI models in `main.py` (e.g., new `Base` subclass)
2. **API endpoints:** Add Express routes in `server.ts` AND FastAPI routes in `main.py` with identical surface
3. **Frontend:** Create new screen component in `src/frontend/src/components/` (PascalCase)
4. **State:** Add state variables to `App.tsx` (e.g., `const [resources, setResources] = useState([])`)
5. **Routing:** Add screen type to `type Screen = ...` in `App.tsx` line 16, add `AnimatePresence` branch for new screen

**New Component/Modal:**
- Implementation: Create new file in `src/frontend/src/components/` (PascalCase, e.g., `MyNewModal.tsx`)
- Export: Default export React functional component
- Props: Define `interface Props { ... }` at top of file
- Integration: Import in `App.tsx`, add state variables for isOpen/onClose, render in JSX

**Utilities/Helpers:**
- Shared HTTP: Keep in `App.tsx` as `authHeaders()` or move to `src/frontend/src/utils/` if extracted
- Shared calculations: Keep in `App.tsx` or server backend (e.g., `recalcVendorRating()` is in Express `server.ts`)
- Type definitions: Add to `src/frontend/src/types.ts`

**API-Only Changes (no UI):**
- Express: Edit `server.ts` routes
- FastAPI: Edit `main.py` routes
- Ensure both implementations stay in sync (same endpoint path, same behavior, same auth requirements)

## Special Directories

**`src/frontend/dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `npm run build`)
- Committed: No (gitignored)
- Contents: Minified HTML, CSS, JavaScript assets; served by nginx in Docker

**`src/frontend/node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes (by `npm install`)
- Committed: No (gitignored)
- Note: Use `npm install` after cloning; lockfile is `package-lock.json` (not committed in this repo)

**`.venv/`:**
- Purpose: Python virtual environment (backend dependencies)
- Generated: Yes (by `uv venv` or `python -m venv`)
- Committed: No (gitignored)
- Note: Use `uv run` or activate venv before running FastAPI or uvicorn

**`src/frontend/app.db`:**
- Purpose: SQLite database for local dev (Express server)
- Generated: Yes (created by `server.ts` on first run)
- Committed: No (gitignored)
- Note: Reset by deleting file; tables auto-created by `db.exec()` on startup; users/streets/vendors seeded if empty

---

*Structure analysis: 2026-03-18*
