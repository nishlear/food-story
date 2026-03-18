# Coding Conventions

**Analysis Date:** 2026-03-18

## Naming Patterns

**Files:**
- **Components:** PascalCase, one component per file
  - Example: `LoginScreen.tsx`, `AddLocationModal.tsx`, `VendorBottomSheet.tsx`
  - Location: `src/frontend/src/components/`
- **Utilities/Helpers:** camelCase
  - Example: `server.ts` (Express server), `main.py` (FastAPI app)
- **Types:** `types.ts` contains all shared TypeScript types
- **Backend models:** PascalCase
  - Example: `FoodStreet`, `FoodVendor`, `AppUser`, `FoodComment` in `main.py`

**Functions:**
- camelCase for all functions
  - Example: `handleLogin`, `handleAddLocation`, `showToast`, `getUserFromToken`
- Handler functions prefixed with `handle`
  - Example: `handleSubmit`, `handleMapClick`, `handleSelectLocation`
- Async functions use `async/await` pattern
- Type-guarded functions in FastAPI use `Depends()` pattern

**Variables:**
- camelCase for state variables, props, and local variables
  - Example: `currentUser`, `selectedLocation`, `isAddingVendor`, `toastMessage`
- Boolean variables prefixed with `is`, `has`, or `can`
  - Example: `isOpen`, `isAddingVendor`, `canAddVendor`
- State getters/setters paired as `[value, setValue]` (React hooks)

**Types:**
- Interfaces prefixed with capital letter, PascalCase
  - Example: `CurrentUser`, `Comment`, `AdminStats`, `User`
  - Types stored in `src/frontend/src/types.ts`
- Python model classes use PascalCase with clear naming: `FoodStreet`, `FoodVendor`, `AppUser`, `FoodComment`
- Pydantic schemas use PascalCase with suffixes: `Base`, `Create`, `Response`
  - Example: `FoodVendorBase`, `FoodVendorCreate`, `FoodVendorResponse`

## Code Style

**Formatting:**
- TypeScript: ES2022 target, React 19 JSX syntax
- CSS: Tailwind CSS for styling (no separate CSS files)
- Python: FastAPI/SQLAlchemy conventions

**Imports:**
- Organized by category (React first, then third-party, then local)
- Example from `App.tsx`:
  ```typescript
  import React, { useState, useEffect } from 'react';
  import { AnimatePresence } from 'motion/react';
  import { CurrentUser } from './types';
  import LoginScreen from './components/LoginScreen';
  ```
- Python imports: standard library, third-party, then local
  - Example from `main.py`:
    ```python
    import base64
    import json
    import os
    import uuid
    from typing import List, Optional

    from fastapi import Depends, FastAPI, Header, HTTPException
    from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text, create_engine, text
    ```

**Linting:**
- TypeScript type-checking via `npm run lint` (tsc --noEmit)
- No ESLint or Prettier configured in the codebase
- Note: `tsc --noEmit` may report false-positive `key` prop errors on React 19 components; Vite build is authoritative

## Import Organization

**Order:**
1. React and motion libraries
2. Third-party UI/utility packages (lucide-react, Tailwind)
3. Local type definitions (`types.ts`)
4. Local components and utilities

**Path Aliases:**
- `@/*` alias maps to current directory root in `tsconfig.json`
- Not heavily used in this codebase; most imports use relative paths

## Error Handling

**Patterns:**
- **Try-catch blocks:** Used for async operations
  ```typescript
  try {
    const res = await fetch('/api/auth/login', { ... });
    if (!res.ok) setError('Invalid username or password');
    const data = await res.json();
    onLogin({ username: data.username, role: data.role, token: data.token });
  } catch {
    setError('Connection error. Please try again.');
  } finally {
    setLoading(false);
  }
  ```
- **Console logging:** Minimal use, only for errors in development
  - Example: `console.error('Failed to fetch streets:', err)`
  - Located in `src/frontend/src/App.tsx` (lines 49, 117) and `src/frontend/server.ts` (line 378)
- **HTTP error responses:** Use standard HTTP status codes
  - 401 for unauthorized (missing/invalid token)
  - 403 for forbidden (insufficient permissions)
  - 400 for bad requests (validation failure)
  - 404 for not found resources

**Python backend:**
- FastAPI HTTPException for error responses
  ```python
  raise HTTPException(status_code=401, detail="Unauthorized")
  raise HTTPException(status_code=403, detail="Forbidden")
  ```
- Query results return `None` if not found; code checks explicitly
- Comments use try-except for graceful degradation when catching exceptions

## Logging

**Framework:** Console logging only (no structured logging)

**Patterns:**
- Minimal logging in production code
- Error logging used for debugging (fetch failures, etc.)
- Server startup logged to console: `console.log('Server running on http://localhost:3000')`
- Python backend logs via FastAPI/Uvicorn; no custom logging setup

## Comments

**When to Comment:**
- Code is largely self-documenting; comments sparse
- Section headers used in server/backend files to organize code blocks
  - Example: `// --- Database Setup ---`, `// --- Auth Endpoints ---`
- Comments explain WHY, not WHAT (code speaks for itself)

**JSDoc/TSDoc:**
- Not used in this codebase
- Type annotations via TypeScript interfaces provide documentation

## Function Design

**Size:**
- Component functions: 100-200 lines typical (see MapInterface.tsx, VendorBottomSheet.tsx)
- Utility functions: 5-30 lines
- Handler functions: single responsibility, 5-15 lines

**Parameters:**
- Functions accept single Props interface or destructured parameters
  ```typescript
  export default function LoginScreen({ onLogin }: Props) { ... }
  export default function MapInterface({ location, vendors, onBack, ... }: Props) { ... }
  ```
- Props interface defined inline or in types file
- Python backend uses Pydantic models and FastAPI dependency injection

**Return Values:**
- Components return JSX.Element (implicit)
- Async functions return Promise<void> or data
- Python endpoints return JSON responses or raise HTTPException

## Module Design

**Exports:**
- One primary export per component file: `export default function ComponentName() { ... }`
- Utility functions exported as named exports (if used in multiple places)
- TypeScript interfaces exported for reuse across components

**Barrel Files:**
- No barrel files (index.ts re-exports) used
- Components imported directly: `import LoginScreen from './components/LoginScreen'`

## Special Patterns

**React Hooks:**
- `useState` for component state
- `useEffect` for side effects (fetching data)
- `useRef` for DOM element references (e.g., map click detection)
- State updates via setter functions: `setState(prev => ...)`

**Async Patterns:**
- Raw `fetch()` API used (no axios or similar)
- `async/await` with try-catch error handling
- Loading states managed via `useState`

**Auth Pattern:**
- Token stored as `X-Role-Token` header in all requests
- Token format: `base64(role:username)`
- Decoded on backend to extract role and username
- Role-based access control checks on each endpoint

**Animation:**
- `motion` package (framer-motion wrapper) for animations
- AnimatePresence for component entrance/exit animations
- `initial`, `animate`, `exit` props for motion effects

---

*Convention analysis: 2026-03-18*
