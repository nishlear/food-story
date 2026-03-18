# Testing Patterns

**Analysis Date:** 2026-03-18

## Test Framework

**Runner:**
- No test framework configured in this project
- `npm run lint` runs `tsc --noEmit` (TypeScript type-checking only)
- Note: Vite build (`npm run build`) is the authoritative build check

**Assertion Library:**
- Not applicable (no tests present)

**Run Commands:**
```bash
npm run lint              # TypeScript type-check (tsc --noEmit)
npm run build             # Production Vite build (authoritative check)
npm run dev               # Development server with HMR
```

## Test File Organization

**Current State:**
- No test files in source code
- Only TypeScript type-checking via tsc

**Patterns:**
- Component files in `src/frontend/src/components/` are not tested
- Backend routes in `src/backend/main.py` are not tested
- Backend routes in `src/frontend/server.ts` are not tested

## Test Structure

**No testing structure exists** for this project. The codebase is organized as follows:

**Frontend:**
- Components: `src/frontend/src/components/` (19 component files)
- Types: `src/frontend/src/types.ts`
- Main app: `src/frontend/src/App.tsx`
- Server: `src/frontend/server.ts` (Express server for local dev)

**Backend:**
- FastAPI app: `src/backend/main.py`
- Standalone utilities: `src/geolocation.py`, `src/map.py`

## Mocking

**Not applicable** — no testing framework configured. However, the codebase architecture enables mocking:

**Frontend Considerations:**
- API calls use raw `fetch()` API, easily mockable with `jest.mock()` or similar
- Auth tokens passed via `X-Role-Token` header
- Current user stored in `App.tsx` state (`currentUser`)

**Backend Considerations:**
- FastAPI uses dependency injection (`Depends()`) for auth and database
- Database layer: SQLAlchemy ORM with session management
- Would be testable with FastAPI TestClient and in-memory SQLite

## Fixtures and Factories

**Not implemented.** Seed data is hardcoded:

**Frontend seed data:**
- Initial streets: `Khao San Road`, `Jemaa el-Fnaa`
- Initial vendors: `Pad Thai Master`, `Mango Sticky Rice`
- Seed logic: `src/frontend/server.ts` lines 59-79

**Backend seed data:**
- Hardcoded users: `user`, `foodvendor`, `admin` (all with password `123123`)
- Seed logic: `src/backend/main.py` lines 271-287
- Both backends initialize on startup if no data exists

## Coverage

**Requirements:** Not enforced

**Recommendations:**
- Would be valuable to add coverage for:
  - Auth endpoints (role-based access control)
  - CRUD endpoints (streets, vendors, comments)
  - Component rendering with different user roles
  - Error handling (invalid credentials, unauthorized access, not found)

## Test Types

**Unit Tests:**
- Would test: utility functions, type validation, auth helpers
- Candidates: `getUserFromToken()`, `getRoleFromRequest()` in `server.ts` and `main.py`

**Integration Tests:**
- Would test: API endpoints with database, auth flow, role-based access
- Candidates: `/api/streets`, `/api/vendors`, `/api/comments`, auth endpoints

**E2E Tests:**
- Would test: full user flows (login → select location → view vendors → add comment)
- Would verify: screen transitions, animations, data persistence

## Important Testing Gaps

### Authentication

**Auth System:** Token = `base64(role:username)` sent as `X-Role-Token` header

Hardcoded test accounts:
```
user         / 123123 / read-only user
foodvendor   / 123123 / can add vendors
admin        / 123123 / full CRUD
```

**Not tested:**
- Invalid token handling
- Missing token on protected endpoints
- Role-based access control boundaries
- Password change validation
- Register validation (duplicate username, empty fields)

### API Endpoints

**Streets Endpoints (`src/frontend/server.ts` lines 161-193, `src/backend/main.py`):**
- `GET /api/streets` — requires any auth
- `POST /api/streets` — admin only
- `PUT /api/streets/:id` — admin only
- `DELETE /api/streets/:id` — admin only

**Not tested:**
- Non-existent street ID handling
- Vendor count accuracy in list response
- Cascading delete of vendors when street deleted

### Frontend Components

**No testing of:**
- Component rendering based on role (`currentUser.role`)
- Form validation in modals
- Toast message display and auto-dismiss
- Screen transitions and animations
- Modal open/close behavior
- Map click coordinate calculation

### Database

**Not tested:**
- Foreign key constraints
- Cascade delete behavior
- Data integrity after concurrent operations
- Constraint violations (e.g., duplicate username)

### Error Handling

**Untested scenarios:**
- Network failures (connection timeout, 5xx errors)
- Invalid JSON responses
- Type mismatches in API responses
- Rating recalculation with no comments
- Edge cases: max rating (5), min rating (1)

## Development Recommendations

**To add testing:**

1. **Install test framework:**
   ```bash
   npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event
   ```

2. **Create test structure:**
   - `src/frontend/src/__tests__/` for component tests
   - `src/frontend/src/__tests__/utils/` for utility tests
   - `src/backend/tests/` for FastAPI endpoint tests

3. **Test locations:**
   - Co-locate tests with components: `LoginScreen.test.tsx` next to `LoginScreen.tsx`
   - Or separate in `__tests__` directory

4. **Key areas to prioritize:**
   - Auth validation (most security-critical)
   - Role-based access control (prevents data leaks)
   - Form validation (prevents invalid data submission)
   - Component rendering with different roles

---

*Testing analysis: 2026-03-18*
