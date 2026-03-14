# Food Story — Street Food Audio Guide

A mobile-first web application for exploring street food. Users browse food streets on an interactive map, discover vendor details, and listen to audio narrations about each spot. Built as a seminar project.

**Author:** Tran Dang Khoa

---

## Features

- **Interactive Map** — Browse vendor pins on a stylized street map; tap to see details in a bottom sheet
- **Audio Narration** — Auto-play narration when dwelling near a vendor (Web Speech API)
- **Role-Based Access** — Three roles with different permissions: User, Food Vendor, Admin
- **Full CRUD** — Admins can manage streets and vendors; food vendors can submit vendor requests
- **Multilingual** — UI and narration support multiple languages

## Roles & Accounts

| Username | Password | Permissions |
|---|---|---|
| `user` | `123123` | View streets and vendors |
| `foodvendor` | `123123` | View + request new vendors |
| `admin` | `123123` | Full CRUD on streets and vendors |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, motion/react |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Docker) / SQLite (local dev) |
| Container | Docker, nginx |

## Getting Started

### Local Development

```bash
cd src/frontend
npm install
npm run dev     # http://localhost:3000
```

The dev server (`server.ts`) runs Express + Vite with a local SQLite database. No other services needed.

### Docker

```bash
docker-compose up --build
```

Starts three services: PostgreSQL, FastAPI backend (port 8000), and nginx serving the React build (port 3000).

> If Docker is unavailable, start [Colima](https://github.com/abiosoft/colima) first: `colima start`

### Python Backend (standalone)

```bash
cd src/backend
uv run uvicorn main:app --reload    # http://localhost:8000
```

## Project Structure

```
food-story/
├── src/
│   ├── frontend/           # React app + Express dev server
│   │   ├── src/
│   │   │   ├── App.tsx         # Root: auth state, screen routing
│   │   │   ├── types.ts        # Shared TypeScript types
│   │   │   └── components/     # One file per component
│   │   └── server.ts           # Local dev server (Express + SQLite)
│   ├── backend/            # FastAPI REST API (Docker)
│   │   └── main.py
│   └── static/             # Standalone GPS + TTS prototype
├── docs/
│   ├── code_structure.md   # Detailed architecture reference
│   └── TODO.md             # Planned features
└── docker-compose.yml
```

## API

All endpoints require an `X-Role-Token` header (except `POST /api/auth/login`).

| Method | Path | Role |
|---|---|---|
| `POST` | `/api/auth/login` | — |
| `GET` | `/api/streets` | any |
| `POST` | `/api/streets` | admin |
| `PUT/DELETE` | `/api/streets/:id` | admin |
| `GET` | `/api/streets/:id/vendors` | any |
| `POST` | `/api/streets/:id/vendors` | admin, foodvendor |
