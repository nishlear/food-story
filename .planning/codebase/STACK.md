# Technology Stack

**Analysis Date:** 2026-03-18

## Languages

**Primary:**
- **TypeScript** 5.8.2 - Frontend and Express server (`src/frontend/`)
- **Python** 3.12 - FastAPI backend (`src/backend/main.py`)
- **JavaScript** - Runtime for Node.js and browser

**Secondary:**
- **SQL** - Database queries (SQLite in dev, PostgreSQL in Docker)
- **HTML/CSS** - React components (JSX/TSX)

## Runtime

**Environment:**
- **Node.js** 22 (Alpine) - Frontend/Express server
- **Python** 3.12-slim - FastAPI backend

**Package Manager:**
- **npm** (Node) - Frontend dependencies
- **uv** (Python) - Python package manager
- **pip** (fallback) - Python dependency installation

## Frameworks

**Core:**
- **React** 19.0.0 - UI framework (`src/frontend/src/`)
- **FastAPI** >=0.128.7 - Backend API framework (`src/backend/main.py`)
- **Express** 4.21.2 - Local dev server and routing (`src/frontend/server.ts`)

**Styling:**
- **Tailwind CSS** 4.1.14 - Utility-first CSS framework
- **@tailwindcss/vite** 4.1.14 - Vite integration for Tailwind

**Build/Dev:**
- **Vite** 6.2.0 - Frontend build tool and dev server
- **tsx** 4.21.0 - TypeScript executor for Node
- **@vitejs/plugin-react** 5.0.4 - React Fast Refresh support

## Key Dependencies

**Critical:**
- **better-sqlite3** 12.4.1 - SQLite driver for Express/dev server
- **sqlalchemy** - Python ORM for database models
- **pydantic** - Python data validation
- **psycopg2-binary** - PostgreSQL adapter for FastAPI

**UI & Animation:**
- **motion** 12.23.24 - Framer Motion (React animations)
- **lucide-react** 0.546.0 - SVG icon library
- **react-dom** 19.0.0 - React DOM rendering

**Utilities:**
- **dotenv** 17.2.3 - Environment variable loading
- **@google/genai** 1.29.0 - Google Gemini AI API client

**Dev Dependencies:**
- **typescript** 5.8.2 - TypeScript compiler
- **@types/node** 22.14.0 - Node.js type definitions
- **@types/express** 4.17.21 - Express type definitions
- **autoprefixer** 10.4.21 - CSS vendor prefixes
- **tailwindcss** 4.1.14 - Tailwind CSS core

## Configuration

**Environment:**
- Frontend: `GEMINI_API_KEY`, `APP_URL` (via `.env` file or AI Studio secrets)
- Backend: `DATABASE_URL` (set in `docker-compose.yml` for PostgreSQL, defaulting to SQLite)
- Frontend Vite: `DISABLE_HMR` (disable Hot Module Replacement in AI Studio)

**Build:**
- Frontend: `vite.config.ts` - Vite config with React, Tailwind plugins, path aliases
- Backend: `Dockerfile` (multi-stage Node build for frontend, FastAPI server)
- Local Dev: `src/frontend/server.ts` - Express middleware serving Vite dev server

## Platform Requirements

**Development:**
- Node.js 22+
- Python 3.12+
- TypeScript 5.8+
- `uv` package manager or `pip`

**Production:**
- **Docker**: Deployment via `docker-compose.yml`
  - Database: PostgreSQL 16 (named volume `postgres_data`)
  - Backend: FastAPI on port 8000
  - Frontend: Nginx on port 3000
- **Node.js Cloud Platforms**: AI Studio Cloud Run (mentioned in `.env.example`)

---

*Stack analysis: 2026-03-18*
