# Codebase Concerns

**Analysis Date:** 2026-03-18

## Security Issues

### Authentication: Insecure Token Generation

**Risk:** Tokens are base64-encoded, not cryptographically signed. `base64(role:username)` can be trivially forged by any client.
- Files: `src/frontend/server.ts` lines 118, 136; `src/backend/main.py` lines 319, 341
- Impact: Any user can impersonate any role (admin, foodvendor) and gain unauthorized access to sensitive endpoints. Role-based access control is completely bypassed.
- Mitigation: Role guards check token validity, but the token format itself is attackable (line 89 in server.ts: `if (['user', 'foodvendor', 'admin'].includes(role)) return { role, username }`)
- Fix approach: Switch to JWT with HMAC-SHA256 signature. Validate token signature on every request, not just role presence.

### Authentication: Hardcoded Default Credentials

**Risk:** Three hardcoded user accounts with trivial passwords (`123123`) are seeded into every database.
- Files: `src/frontend/server.ts` lines 64-66; `src/backend/main.py` lines 275-282
- Passwords: `user:123123`, `foodvendor:123123`, `admin:123123`
- Impact: Production deployment will have a known admin account with password `123123`. Any attacker can log in as admin and perform full CRUD on all resources.
- Fix approach: Remove hardcoded seeding. Implement initial setup wizard or require environment-based admin creation on first deploy.

### Password Storage: Plain Text

**Risk:** Passwords are stored unencrypted in database.
- Files: `src/frontend/server.ts` line 135; `src/backend/main.py` lines 335-336
- Password comparison: Direct string equality `entry.password !== password` (server.ts:115, main.py:317)
- Impact: Database breach exposes all user passwords in plain text. No password history protection or verification.
- Fix approach: Use bcrypt (NPM) or argon2 (Python) for password hashing. Update password comparison to use hash verification.

### CORS: Allow All Origins

**Risk:** CORS middleware configured with `allow_origins=["*"]`.
- Files: `src/backend/main.py` lines 250-254
- Impact: Any website can make authenticated requests to the API on behalf of users. Cross-site request forgery (CSRF) attacks possible.
- Fix approach: Restrict `allow_origins` to known frontend domains only (e.g., `["https://example.com", "http://localhost:3000"]`).

### Password Change: No Current User Check

**Risk:** Admin can change any user's password, but the password change endpoint does not verify the current password is correct before changing it.
- Files: `src/frontend/server.ts` lines 141-157; `src/backend/main.py` lines 345-358
- Both endpoints verify old password (line 152/354), but this is the only safeguard. No rate limiting on attempts.
- Impact: If token is leaked, attacker can change password without knowing current password (though token-based auth means this is a lower-priority risk).
- Fix approach: Add rate limiting (max 5 attempts per minute per user). Consider adding email verification for password changes.

## Tech Debt

### Frontend State Management: Monolithic App.tsx

**Problem:** All state lives in a single `App.tsx` component (270 lines, ~40+ state variables).
- Files: `src/frontend/src/App.tsx`
- State variables: `currentUser`, `currentScreen`, `locations`, `vendors`, `selectedLocation`, `selectedVendor`, `isSettingsOpen`, `toastMessage`, `isAddLocationOpen`, `editingLocation`, `deletingLocation`, `isAddingVendor`, `isAddVendorModalOpen`, `newVendorCoords`, `audioEnabled`, `textSize`
- Impact: Difficult to track state changes. No clear data flow. Changes to one modal may affect unrelated state. Performance: all child components re-render on any state change.
- Fix approach: Implement Context API or useReducer for auth state. Move UI state (modals, settings) to individual component hooks. Create custom hooks for API calls (`useFetchStreets`, `useFetchVendors`).

### Component Files: Large and Mixed Concerns

**Problem:** Component files mix UI, API calls, and business logic with no separation.
- Files: 19 component files totaling 3638 lines
- Largest components: `VendorBottomSheet.tsx` (192 lines), `ChangePasswordModal.tsx` (149 lines), `VendorEditModal.tsx` (133 lines)
- Example (VendorBottomSheet): Renders UI, fetches comments, handles edit state, has role-based conditionals all in one file
- Impact: Testing is impossible without mocking API. Reusing API logic across components requires copy-paste. Hard to maintain.
- Fix approach: Extract API calls into custom hooks. Move role-based logic to permission helpers. Split large components (>120 lines) into smaller focused components.

### Database Schema Mismatch: SQLite vs PostgreSQL

**Problem:** Two separate implementations with different databases and ORMs cause data model divergence.
- Express/SQLite: `src/frontend/server.ts` uses raw SQL queries (better-sqlite3)
- FastAPI/PostgreSQL: `src/backend/main.py` uses SQLAlchemy ORM
- Files involved: `src/frontend/server.ts` (all CRUD endpoints), `src/backend/main.py` (all CRUD endpoints)
- Schema evolution: Both implementations must be kept in sync. Migrations are manual (server.ts lines 53-57: `try/catch ALTER TABLE`; main.py lines 85-89: inline raw SQL)
- Impact: Easy to add a field to one database but forget the other. No shared migration system. Risk of data loss during schema changes.
- Fix approach: Commit to one backend. If Docker is the target, delete `server.ts` and use FastAPI exclusively. If local dev, migrate to FastAPI locally and remove `main.py`.

### API Error Handling: Inconsistent and Silent

**Problem:** Errors are caught but often silently ignored, giving users no feedback.
- Frontend: `src/frontend/src/App.tsx` lines 79-80, 104-105: `.catch { showToast(...) }` only shown on explicit catch
- Many API calls have `.catch(() => setComments([]))` (VendorBottomSheet.tsx:35) with no user notification
- Files: `src/frontend/src/App.tsx`, all component files making fetch calls
- Backend: Error responses are HTTP exceptions (main.py), but frontend doesn't consistently handle them
- Impact: Network errors, validation errors, and permission errors appear as silent failures. Users don't know if an action succeeded or failed. Makes debugging harder.
- Fix approach: Create `useApi()` hook that handles all HTTP errors. Show toast for every error. Log errors to console in dev mode.

### Missing Input Validation: Frontend

**Problem:** Form inputs lack validation. No client-side checks before sending requests.
- Files: `src/frontend/src/components/AddVendorModal.tsx`, `AddLocationModal.tsx`, `RegisterForm.tsx`
- Example: Vendor name can be empty string. Location city can be empty. Registration has no password strength requirements.
- Backend validates (server.ts:125-126, main.py:325-326), but user sees generic "failed" message
- Impact: Poor UX. Server rejects invalid input with no explanation. Database may contain empty/invalid data if server validation is bypassed.
- Fix approach: Add client-side validation with specific error messages. Show validation errors inline on form fields. Match backend validation rules exactly.

### Missing Tests: Zero Coverage

**Problem:** No test files exist anywhere in the codebase.
- Files: 0 test files found (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.py`)
- Scope: No unit tests for API endpoints, no component tests, no integration tests
- Impact: Changes can break features without detection. Refactoring is risky. Auth system (the most critical code) has zero test coverage.
- Fix approach: Start with API endpoint tests (Jest for Express, pytest for FastAPI). Add unit tests for auth functions. Add component tests for form components (React Testing Library).

### Type Safety: Heavy Use of `any`

**Problem:** TypeScript types are weak. Many variables typed as `any`.
- Files: `src/frontend/src/App.tsx` lines 22-26, 34, 109, 151; `src/backend/main.py` uses dynamic Python typing
- Example: `const [locations, setLocations] = useState<any[]>([])`, `const [vendors, setVendors] = useState<any[]>([])`
- Database query results in server.ts have type `any` (line 60, 114: `as { count: number }`; line 224: `as any`)
- Impact: TypeScript cannot catch type errors at compile time. `any` defeats the purpose of using TypeScript. Refactoring is unsafe.
- Fix approach: Create proper types for all API responses. Use `response_model` in FastAPI endpoints. Remove `any` casts. Enable `noImplicitAny: true` in tsconfig.json.

### Image Storage: No Validation or Limits

**Problem:** Images are stored as JSON string in database. No validation of URLs, no storage strategy, no size limits.
- Files: `src/frontend/server.ts` line 31; `src/backend/main.py` line 54
- Schema: `images TEXT` stores JSON array of URL strings
- Current implementation: Uses placeholder images (`https://picsum.photos/seed/...`)
- Impact: Users can upload arbitrary URLs (including malicious ones). Database grows with every vendor. No cleanup of old images.
- Fix approach: If using external URLs, validate domain whitelist. If implementing file uploads, use S3 or similar. Add max image count (e.g., 3 per vendor). Add image URL validation.

### Vendor Ownership: Inconsistent Enforcement

**Problem:** `owner_username` field added to vendors, but ownership logic is incomplete.
- Files: `src/frontend/server.ts` lines 213, 234-238; `src/backend/main.py` lines 489-490, 544
- Express: Foodvendor can only update `name, description, images` (not coordinates, rating, type)
- FastAPI: Same restriction (lines 546-548)
- But: Both allow admin to change ownership via `owner_username` in PUT request
- Impact: No audit trail of ownership changes. Foodvendor can create multiple vendors but can't see who created them. Can't transfer ownership without admin.
- Fix approach: Add `created_by` (immutable) and `owner` (changeable only by admin) fields. Add audit log. Provide UI for vendor owners to transfer ownership.

## Performance Concerns

### N+1 Query Problem: Streets Endpoint

**Problem:** Getting all streets with vendor counts queries database inefficiently.
- Files: `src/frontend/server.ts` lines 164-169; `src/backend/main.py` lines 371-386
- Express: For each street, runs separate query: `SELECT COUNT(*) as count FROM vendors WHERE street_id = ?`
- With 100 streets, this is 101 queries (1 for streets + 100 for counts)
- Impact: Linear performance degradation as number of streets grows. No pagination.
- Fix approach: Use SQL JOIN with aggregate function. Express: `SELECT s.*, COUNT(v.id) as vendors_count FROM streets s LEFT JOIN vendors v ON s.id = v.street_id GROUP BY s.id`. Add pagination (limit/offset).

### Component Re-renders: No Memoization

**Problem:** All child components re-render when any App.tsx state changes.
- Files: `src/frontend/src/App.tsx` (all child components)
- Example: Changing `audioEnabled` re-renders entire `LocationSelection`, which re-renders all location cards even though they haven't changed
- Impact: Slow interactions on large datasets (100+ vendors). No obvious lag yet, but will become a problem.
- Fix approach: Wrap component children with `React.memo()`. Split state into smaller contexts. Use `useCallback` for event handlers.

### Image JSON Parsing: Repeated on Every Render

**Problem:** Image JSON is parsed on every query, even when not displayed.
- Files: `src/frontend/server.ts` line 201; `src/backend/main.py` lines 467, 517, 555, 739
- Pattern: `JSON.parse(v.images || '[]')` happens on every fetch, even if image gallery not opened
- Impact: Unnecessary CPU/memory on large datasets. Images should be parsed once and cached.
- Fix approach: Parse images at query time if image gallery is opened. Or pre-parse on vendor object creation. Consider storing image count instead of full JSON.

## Missing Features / Incomplete Implementation

### Admin Dashboard: Partially Implemented

**Problem:** Admin dashboard exists but lacks core functionality.
- Files: `src/frontend/src/components/AdminScreen.tsx` (77 lines), AdminDashboard.tsx, AdminUsersTab.tsx, AdminVendorsTab.tsx, AdminCommentsTab.tsx
- Tabs implemented: Users, Vendors, Comments
- Missing: No vendor assignment UI. Vendor owners can't be assigned. No bulk operations. No statistics. No data export.
- Impact: Admins must use curl/Postman to assign vendors to owners. Can't see vendor ownership in UI.
- Fix approach: Add column for `owner_username` in AdminVendorsTab. Add "Assign Owner" button. Add filter/search. Add export CSV.

### Map: Hard-coded Mock

**Problem:** Map is a mockup with static background gradients and lines. Not a real map.
- Files: `src/frontend/src/components/MapInterface.tsx` lines 42-52
- Coordinates are percentages (0-100) stored as `x, y` floats, but no actual geo-mapping
- TODO in docs (docs/TODO.md line 16-17): "map resolution or how to convert from long-lat to position on hand-drawn map"
- Impact: Vendors are placed as dots on abstract 2D plane, not on actual street map. Hard to navigate in real-world food streets.
- Fix approach: Implement real map (Mapbox, Google Maps, or OpenStreetMap). Store actual latitude/longitude. Show vendor locations relative to user position.

### Comments: No Admin Moderation

**Problem:** Comments can be deleted by admin, but there's no moderation interface.
- Files: `src/frontend/server.ts` lines 287-293; `src/backend/main.py` lines 649-666
- Admin can delete, but no UI flag for "report comment" or "spam". No comment approval workflow.
- Impact: Users can post any text, including offensive content. Admins can only delete after the fact.
- Fix approach: Add comment reporting (flag for admin review). Add comment approval toggle in admin dashboard. Add spam filter (keyword blacklist).

## Fragile Areas

### Auth Token: Stored in React State

**Problem:** Auth token is stored in `currentUser` React state and passed to every fetch call.
- Files: `src/frontend/src/App.tsx` lines 39-42 (authHeaders function)
- Token is lost on page refresh. No persistence. No secure storage.
- Impact: Users are logged out when they refresh. Poor UX. Also, token is never cleared on logout (React state is cleared, but no server-side session invalidation).
- Fix approach: Store token in localStorage (with security caveat: XSS vulnerability). Or store in httpOnly cookie (requires backend to set cookie). Implement logout endpoint that invalidates token server-side.

### Database Initialization: Duplicated Logic

**Problem:** Database seeding and schema creation are split between two files with no coordination.
- Express (server.ts): Seeding happens on every server start (lines 60-79). Schema creation via db.exec() (lines 13-50). ALTER TABLE in try/catch (lines 53-57).
- FastAPI (main.py): Seeding happens on import (lines 286-287). Schema creation via SQLAlchemy.create_all() (line 91). ALTER TABLE inline (lines 86-89).
- Impact: If you run both servers, you'll create duplicate seed data. Migration strategy is inconsistent. Hard to reset database cleanly.
- Fix approach: Use a database migration tool (Alembic for FastAPI, Knex or TypeORM for Express). Separate seeding from migration. Create `npm run db:seed` and `uv run db:seed` commands.

### File Database Location: Hardcoded in server.ts

**Problem:** SQLite database path is hardcoded to `app.db` in current working directory.
- Files: `src/frontend/server.ts` line 10: `const db = new Database('app.db');`
- CLAUDE.md says it's at `src/frontend/app.db` but code doesn't ensure this. Works only if you run server from `src/frontend` directory.
- Impact: Running server from different directory creates new database. Easy to accidentally create multiple databases.
- Fix approach: Use absolute path based on `__dirname` or environment variable. Store in `.gitignore` location like `.data/app.db`.

## Scaling Limits

### Database: SQLite Not Production-Ready

**Problem:** Local dev uses SQLite (src/frontend/app.db), Docker uses PostgreSQL. SQLite has limitations.
- Concurrent writes: SQLite locks entire database on write, limiting concurrency
- Database size: SQLite has file-size limits (~140TB theoretical, but practical limit is 2-10GB for performance)
- Backups: File-based backups only. No replication.
- Impact: If deployed with SQLite, will fail under concurrent load. No high availability.
- Fix approach: Only use SQLite for local dev. Always use PostgreSQL for production. Consider adding replica database option.

### Frontend Bundle Size: No Code Splitting

**Problem:** All routes and components are bundled into a single JavaScript file.
- Files: Vite is configured but no route-based code splitting
- Imports in App.tsx: All 10+ components imported at top, bundled together
- Impact: Initial page load includes code for all screens (login, location, map, admin) even if user only needs one. Bundle size is larger than necessary.
- Fix approach: Use React lazy() and Suspense for route-based code splitting. Split components that are rarely used (admin dashboard).

### Image URLs: Hardcoded External Dependencies

**Problem:** Seed data uses picsum.photos placeholder images. If service is down, images fail to load.
- Files: `src/frontend/server.ts` lines 77-78
- Impact: Demo data is non-functional if external service is unavailable
- Fix approach: Use local placeholder images or remove from seed data.

## Recommendations by Priority

### High Priority (Fix Before Production)

1. **Change authentication to JWT with signatures** — Current token system is trivially forgeable
2. **Remove hardcoded credentials** — Admin account with password `123123` is a critical vulnerability
3. **Hash passwords with bcrypt/argon2** — Plain text passwords are unacceptable
4. **Add CSRF protection (restrict CORS)** — Current allow_origins=["*"] is insecure
5. **Choose one backend (Express OR FastAPI)** — Maintaining two implementations doubles testing burden and risk of divergence

### Medium Priority (Fix Before Wider Deployment)

6. **Implement proper form validation** — User-facing validation errors improve UX and security
7. **Add comprehensive error handling** — Network errors should always show user feedback
8. **Implement real map with coordinates** — Abstract 2D plane is not useful for food streets
9. **Add state management solution** — Extract state from App.tsx monolith
10. **Add test suite** — No tests means changes are risky

### Low Priority (Nice-to-Have)

11. **Implement image upload/storage** — Current placeholder URLs are not scalable
12. **Add vendor ownership UI** — Admins currently can't assign vendors to owners via UI
13. **Optimize N+1 queries** — Use database JOINs instead of multiple queries
14. **Add code splitting** — Split admin dashboard to separate bundle

---

*Concerns audit: 2026-03-18*
