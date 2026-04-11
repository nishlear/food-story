import os

SUPPORTED_LANGUAGES = ["en", "vi", "ko", "ja", "zh-CN", "zh-TW", "es"]
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./foodguide.db")

_BASE_DIR = os.path.dirname(__file__)
MAPS_DIR = os.path.join(_BASE_DIR, "..", "static", "maps")
AUDIO_DIR = os.path.join(_BASE_DIR, "..", "static", "audio")
