# Architecture

**Analysis Date:** 2026-03-18

## Pattern Overview

**Overall:** Dual-deployment architecture with shared React frontend and parallel backend implementations.

**Key Characteristics:**
- Two independent backend implementations (Express for local dev, FastAPI for Docker)
- Both backends expose identical `/api/*` routes, allowing seamless switching between deployments
- Token-based auth system with `base64(role:username)` tokens passed via `X-Role-Token` header
- React single-page app (Vite-powered) with animation-driven screen transitions
- Role-based access control (RBAC) enforced at API layer, with UI gating via `currentUser.role` checks
- Screen state managed in `App.tsx` root component via React hooks

## Layers

**Presentation (React Frontend):**
- Purpose: Render interactive UI, manage client-side state, handle user interaction
- Location: `src/frontend/src/`
- Contains: Screen components, modal dialogs, form components, type definitions
- Depends on: Express server (local dev) or FastAPI backend (Docker) via `/api/*` routes
- Used by: Web browsers via HTTP

**API Routing Layer:**
- Purpose: Expose REST endpoints, enforce auth/authorization, delegate to data layer
- Location: `src/frontend/server.ts` (Express, local dev only) and `src/backend/main.py` (FastAPI, Docker)
- Contains: Request parsing, middleware (auth, CORS), response formatting
- Depends on: Database layer via direct queries (Express) or ORM (FastAPI)
- Used by: React frontend via fetch()

**Data Layer:**
- Purpose: Persist and retrieve application state
- Location: SQLite (`app.db` in `src/frontend/`) for local dev; PostgreSQL for Docker
- Contains: Five tables (streets, vendors, users, comments, food metadata)
- Depends on: Nothing (lowest layer)
- Used by: Express server (better-sqlite3 raw SQL) and FastAPI backend (SQLAlchemy ORM)

## Data Flow

**Login Flow:**

1. User submits username/password in `LoginScreen` (triggers form handler)
2. `LoginScreen` calls `POST /api/auth/login` with credentials
3. Express/FastAPI server validates against users table
4. Server returns `{ username, role, token }`
5. `LoginScreen` calls `onLogin()` callback → `App.tsx` sets `currentUser` state
6. `App.tsx` transitions from `login` screen to `location` screen

**Location/Vendor Fetch Flow:**

1. `App.useEffect` detects `currentScreen === 'location'` state change
2. App calls `GET /api/streets` with auth header
3. Server checks token, queries streets table + counts vendors per street
4. Server returns `[{ id, name, city, description, vendors_count }, ...]`
5. `App.tsx` sets `locations` state
6. `LocationSelection` component renders location list from props

**Vendor Selection & Map Display:**

1. User taps a location in `LocationSelection` → calls `onSelect()` callback
2. `App.tsx` calls `handleSelectLocation()` → sets `selectedLocation`, transitions to `map` screen
3. App fetches `GET /api/streets/{id}/vendors` in parallel
4. `MapInterface` renders vendors as positioned dots on map with street graphics
5. User taps vendor → `App.tsx` sets `selectedVendor` state
6. `VendorBottomSheet` modal animates up with vendor details and comment form

**State Management:**

- All app state lives in `App.tsx` via `useState` hooks: `currentUser`, `currentScreen`, `locations`, `vendors`, `selectedLocation`, `selectedVendor`, `isAddingVendor`, modal open/close flags
- Child components receive data + callbacks as props; no context or global store used
- Auth token passed to API calls via `authHeaders()` utility function
- Changes to state trigger component re-renders via React's built-in reconciliation

## Key Abstractions

**CurrentUser (Authentication Token):**
- Purpose: Represent logged-in user identity and permissions
- Examples: `src/frontend/src/types.ts` (`CurrentUser` interface)
- Pattern: Base64-encoded token `role:username` stored in `CurrentUser.token`, extracted on each API call via `authHeaders()` helper

**Screens (State Machine):**
- Purpose: Manage visible UI surface (login, location selection, map, admin)
- Examples: `type Screen = 'login' | 'location' | 'map' | 'admin'` in `App.tsx` line 16
- Pattern: Single `currentScreen` state machine; `AnimatePresence` wraps screens so each Screen component gets `key` prop for exit/enter animations

**Modal Dialogs (Overlay State):**
- Purpose: Render temporary UI for CRUD operations, settings, confirmations
- Examples: `AddLocationModal`, `AddVendorModal`, `EditLocationModal`, `SettingsModal`, `VendorBottomSheet`, `ChangePasswordModal`
- Pattern: Controlled by `isOpen` boolean prop and `onClose()` callback; managed via parallel state in `App.tsx`

**Role-Based Access Control (RBAC):**
- Purpose: Restrict operations based on user role (user, foodvendor, admin)
- Examples: `GET /api/streets` (any auth user), `POST /api/streets` (admin only), `POST /api/streets/:id/vendors` (admin or foodvendor)
- Pattern: Express/FastAPI endpoints check token role and return 403 Forbidden if insufficient; React components check `currentUser?.role` to gate UI elements

**Vendor Ownership:**
- Purpose: Allow foodvendors to manage their own vendors, admins to manage all
- Examples: `VendorEditModal` allows edit only if `currentUser.role === 'foodvendor' && vendor.owner_username === currentUser.username`
- Pattern: Vendors store `owner_username` field; PUT `vendors/:id` endpoint enforces ownership check in `main.py` line 544 and `server.ts` line 234

## Entry Points

**Frontend (React):**
- Location: `src/frontend/src/main.tsx`
- Triggers: Browser loads HTML at `/` (served by Express dev server or nginx in Docker)
- Responsibilities: Mount React app to DOM, initialize root `App` component

**Backend - Local Dev (Express):**
- Location: `src/frontend/server.ts`
- Triggers: `npm run dev` from `src/frontend/` directory
- Responsibilities: Start Express server on port 3000, serve Vite dev middleware (HMR), implement all `/api/*` routes with SQLite backend

**Backend - Docker (FastAPI):**
- Location: `src/backend/main.py`
- Triggers: Docker Compose `up` command
- Responsibilities: Start FastAPI on port 8000, connect to PostgreSQL, implement all `/api/*` routes, seed users on startup

**Admin Dashboard:**
- Location: `src/frontend/src/components/AdminScreen.tsx` (parent), with tabs: `AdminDashboard.tsx`, `AdminUsersTab.tsx`, `AdminVendorsTab.tsx`, `AdminCommentsTab.tsx`
- Triggers: User clicks admin button (if role === admin) in `LocationSelection`
- Responsibilities: Display stats, list/edit users, vendors, comments; accessible only to admin role

## Error Handling

**Strategy:** Client-side error catching with user feedback via toast messages; server returns standard HTTP status codes.

**Patterns:**

- **401 Unauthorized:** No valid token in header or token decoding failed. Server returns `{ error: 'Unauthorized' }`. Client shows error in form or navigates back to login.
- **403 Forbidden:** User authenticated but lacks required role. Server returns `{ error: 'Forbidden' }`. React components prevent admin UI from rendering for non-admins.
- **400 Bad Request:** Invalid input (missing fields, invalid role). Server returns `{ error: '[specific message]' }`. Modals validate form fields client-side before submit.
- **409 Conflict:** Username already exists during registration. Server returns `{ error: 'Username already taken' }`. Form displays error message.
- **404 Not Found:** Resource doesn't exist (street, vendor, user). Server returns `{ error: '[resource] not found' }`. App handles gracefully (e.g., return to location list).

Try/catch blocks in `App.tsx` and component handlers catch network errors and call `showToast()` with user message.

## Cross-Cutting Concerns

**Logging:** Console.error in try/catch blocks for debugging; no structured logging framework (PoC stage).

**Validation:**
- Client: Basic HTML5 form validation (`required`, `type="number"` constraints); React components validate rating 1-5 range before submit
- Server: Express/FastAPI validate required fields, data types, role-based permissions; database constraints enforce foreign keys and unique usernames

**Authentication:**
- Mechanism: Base64-encoded token `role:username` sent as `X-Role-Token` header on every authenticated request
- Storage: Token kept in React `currentUser` state; no persistence between sessions
- Hardcoded accounts: user/123123, foodvendor/123123, admin/123123 for PoC
- Challenge: Auth scheme is stateless but passwords stored plaintext in database (security concern for production)

**Authorization:**
- Enforced at API endpoint level by checking user role from token
- UI components gate visibility based on `currentUser?.role` (e.g., Admin tab only shows if `role === 'admin'`)
- Vendor updates allow foodvendor to edit name/description/images only; admins can edit all fields

**Image Handling:**
- Vendors store `images` field as JSON array of URL strings
- Express/FastAPI parse JSON on read, stringify on write
- Frontend can add/remove image URLs in modals; images served from external URLs (picsum.photos in seed data)

**Rating Calculation:**
- Comments table stores individual ratings (1-5); vendors table stores computed `rating` (avg) and `reviews` (count)
- Recalculate triggered on POST/DELETE comments
- Calculation: `recalcVendorRating()` in both `server.ts` (line 259) and `main.py` (line 295) averages comment ratings and updates vendor row

---

*Architecture analysis: 2026-03-18*
