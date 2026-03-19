# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** When a user is physically at a food street, the map shows exactly where they are and where every vendor stall is — making it trivial to navigate the street.
**Current focus:** Phase 1 — Backend Foundation

## Current Position

Phase: 1 of 3 (Backend Foundation)
Plan: 0 of ? in current phase
Status: Ready to plan
Last activity: 2026-03-19 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Store vendor positions as lat/lon (not pixels) — pixel coords break on map resize; project to pixels at render time
- Server-side map generation via staticmap — reuses existing map.py logic; no client tile rendering
- Map as primary view — when a street has a map, the map IS the street experience (not a tab)
- Tap-to-place vendor pins (admin) — more intuitive than manual lat/lon entry

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 2 (map generation): Express dev server cannot run Python directly — decide between `child_process.execFile` calling map.py vs porting math to TypeScript. Resolve at start of Phase 1.
- GPS requires HTTPS: mobile GPS testing requires ngrok; plain HTTP LAN origin causes silent `PERMISSION_DENIED`. (v2 concern, noted for Phase 2+ readiness)

## Session Continuity

Last session: 2026-03-19
Stopped at: Roadmap written, ready to plan Phase 1
Resume file: None
