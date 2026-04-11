import asyncio
import os

import edge_tts

from config import AUDIO_DIR, SUPPORTED_LANGUAGES

_audio_dir = AUDIO_DIR

EDGE_TTS_VOICES = {
    "en": "en-US-GuyNeural",
    "vi": "vi-VN-HoaiMyNeural",
    "ko": "ko-KR-SunHiNeural",
    "ja": "ja-JP-NanamiNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",
    "zh-TW": "zh-TW-HsiaoChenNeural",
    "es": "es-ES-ElviraNeural",
}


async def _generate_single_audio(vendor_id: str, lang: str, text: str, retries: int = 5):
    voice = EDGE_TTS_VOICES.get(lang)
    if not voice or not text:
        return
    out_path = os.path.join(_audio_dir, f"{vendor_id}_{lang}.mp3")
    for attempt in range(1, retries + 1):
        try:
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) == 0:
                os.remove(out_path)
                raise RuntimeError("edge-tts wrote 0 bytes")
            print(f"Generated audio: {out_path}")
            return
        except Exception as e:
            if os.path.exists(out_path):
                os.remove(out_path)
            if attempt < retries:
                await asyncio.sleep(1 * attempt)
            else:
                print(f"TTS generation failed for {vendor_id}/{lang} after {retries} attempts: {e}")


def generate_vendor_audio(vendor_id: str, description_translations: dict):
    async def _run():
        tasks = [
            _generate_single_audio(vendor_id, lang, text)
            for lang, text in description_translations.items()
            if text
        ]
        await asyncio.gather(*tasks)

    asyncio.run(_run())


async def _scan_and_generate_missing_audio():
    """On startup, generate Edge TTS audio for any vendor/language that has a
    description but no corresponding .mp3 file yet."""
    from database import SessionLocal
    from models import FoodVendor
    from utils import normalize_description_translations

    with SessionLocal() as db:
        vendors = db.query(FoodVendor).all()
    print(f"[TTS] Scanning {len(vendors)} vendors for missing audio...")
    tasks = []
    for vendor in vendors:
        translations = normalize_description_translations(vendor.description)
        for lang, text in translations.items():
            if not text or lang not in EDGE_TTS_VOICES:
                continue
            out_path = os.path.join(_audio_dir, f"{vendor.id}_{lang}.mp3")
            if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
                tasks.append(_generate_single_audio(str(vendor.id), lang, text))
    # Run serially to avoid rate-limiting from Edge TTS servers
    for task in tasks:
        await task
    print("[TTS] Startup audio scan complete.")
