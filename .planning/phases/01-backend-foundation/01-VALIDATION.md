---
phase: 1
slug: backend-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test infrastructure exists; manual smoke tests via curl |
| **Config file** | none — Wave 0 creates gen_map.py and maps directories |
| **Quick run command** | `curl -s http://localhost:3000/api/streets -H 'X-Role-Token: YWRtaW46YWRtaW4='` |
| **Full suite command** | Manual curl smoke tests (see Per-Task Verification Map) |
| **Estimated runtime** | ~2 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Run quick curl against affected endpoint to confirm expected fields
- **After every plan wave:** Run full smoke test of all street CRUD routes on both Express and FastAPI
- **Before `/gsd:verify-work`:** All smoke tests must pass on both servers
- **Max feedback latency:** ~2 minutes (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | MSET-01 | smoke | `curl -s http://localhost:3000/api/streets -H 'X-Role-Token: YWRtaW46YWRtaW4='` | ❌ Wave 0 | ⬜ pending |
| 1-01-02 | 01 | 1 | MSET-01 | smoke | `curl -s -X POST http://localhost:3000/api/streets -H 'Content-Type: application/json' -H 'X-Role-Token: YWRtaW46YWRtaW4=' -d '{"id":"test1","name":"Test","city":"Seoul","lat_nw":37.5,"lon_nw":127.0,"lat_se":37.49,"lon_se":127.01}'` | ❌ Wave 0 | ⬜ pending |
| 1-01-03 | 01 | 1 | MSET-02 | smoke | `ls src/frontend/static/maps/ 2>/dev/null && echo EXISTS` | ❌ Wave 0 | ⬜ pending |
| 1-02-01 | 02 | 1 | MSET-02 | smoke | `curl -s http://localhost:8000/api/streets -H 'X-Role-Token: YWRtaW46YWRtaW4='` | ❌ Wave 0 | ⬜ pending |
| 1-02-02 | 02 | 1 | MSET-02 | smoke | `ls src/static/maps/ 2>/dev/null && echo EXISTS` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/backend/gen_map.py` — dedicated generation script for subprocess calls from Express
- [ ] `src/frontend/static/maps/` directory — must exist before first Express map generation
- [ ] `src/static/maps/` directory — must exist before first FastAPI/Docker map generation
- [ ] Smoke test token verified: `admin:admin` → base64 `YWRtaW46YWRtaW4=`

*Wave 0 creates structural prerequisites — no test framework installation needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PNG file generated at `static/maps/{id}.png` after street save with bbox | MSET-02 | No test runner; filesystem check | After POST /api/streets with bbox fields, run `ls src/frontend/static/maps/` and confirm `{id}.png` exists |
| `map_image_path` is `null` for streets without bbox | MSET-01 | No test runner; JSON field check | GET /api/streets, find a street without bbox, confirm `map_image_path` is null in response |
| Both Express and FastAPI return consistent response shape | MSET-01, MSET-02 | Two-server comparison | Run same curl POST against `localhost:3000` and `localhost:8000`; compare JSON responses side-by-side |
| Streets without bbox continue to load normally (no regressions) | MSET-01 | End-to-end regression | Log in as user, navigate map, confirm existing streets load without errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
