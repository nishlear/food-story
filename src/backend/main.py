import asyncio
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401 — import triggers DB create_all and user seeding
from audio import _audio_dir, _scan_and_generate_missing_audio
from config import MAPS_DIR
from routers import admin, auth, comments, streets, vendors

app = FastAPI(title="Street Food Audio Guide API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_maps_dir = MAPS_DIR
os.makedirs(_maps_dir, exist_ok=True)
os.makedirs(_audio_dir, exist_ok=True)

app.mount("/maps", StaticFiles(directory=_maps_dir), name="maps")
app.mount("/audio", StaticFiles(directory=_audio_dir), name="audio")

app.include_router(auth.router)
app.include_router(streets.router)
app.include_router(vendors.router)
app.include_router(comments.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(_scan_and_generate_missing_audio())
