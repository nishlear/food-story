import json
from typing import Dict, Optional
from urllib import error as urllib_error
from urllib import request as urllib_request
import os

from config import SUPPORTED_LANGUAGES


def clean_text(value) -> Optional[str]:
    if not isinstance(value, str):
        return None
    trimmed = value.strip()
    return trimmed or None


def normalize_description_translations(value) -> Dict[str, str]:
    text_value = clean_text(value)
    if not text_value:
        return {}

    try:
        parsed = json.loads(text_value)
        if not isinstance(parsed, dict):
            return {"en": text_value}
        normalized: Dict[str, str] = {}
        for language in SUPPORTED_LANGUAGES:
            translated = clean_text(parsed.get(language))
            if translated:
                normalized[language] = translated
        return normalized
    except (TypeError, json.JSONDecodeError):
        return {"en": text_value}


def pick_display_description(descriptions: Dict[str, str]) -> Optional[str]:
    for language in ["vi", "en", "ko", "ja", "zh-CN", "zh-TW", "es"]:
        translated = clean_text(descriptions.get(language))
        if translated:
            return translated
    for translated in descriptions.values():
        cleaned = clean_text(translated)
        if cleaned:
            return cleaned
    return None


def serialize_description_translations(descriptions: Dict[str, str]) -> Optional[str]:
    normalized: Dict[str, str] = {}
    for language in SUPPORTED_LANGUAGES:
        translated = clean_text(descriptions.get(language))
        if translated:
            normalized[language] = translated
    return json.dumps(normalized) if normalized else None


def normalize_vendor_response(vendor) -> dict:
    result = {c.name: getattr(vendor, c.name) for c in vendor.__table__.columns}
    description_translations = normalize_description_translations(vendor.description)
    result["description"] = pick_display_description(description_translations)
    result["description_translations"] = description_translations
    result["description_language"] = "en"
    result["images"] = json.loads(vendor.images) if vendor.images else []
    return result


def translate_vietnamese_description(description: str) -> Dict[str, str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    target_languages = [language for language in SUPPORTED_LANGUAGES if language != "vi"]
    payload = {
        "model": "gpt-4o-mini",
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You translate Vietnamese vendor descriptions into other languages. "
                    "Return JSON only. Preserve meaning, tone, and food-specific details. "
                    "Keys must exactly match the requested language codes."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "source_language": "vi",
                        "source_text": description,
                        "target_languages": target_languages,
                    }
                ),
            },
        ],
    }
    req = urllib_request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib_error.URLError as exc:
        raise RuntimeError("OpenAI translation request failed") from exc

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    parsed = json.loads(content) if isinstance(content, str) and content else {}
    translations: Dict[str, str] = {}
    for language in target_languages:
        translated = clean_text(parsed.get(language)) if isinstance(parsed, dict) else None
        if translated:
            translations[language] = translated
    return translations


def build_description_translations(
    existing_value,
    description,
    description_language: Optional[str],
    provided_translations: Optional[dict] = None,
) -> Dict[str, str]:
    if isinstance(provided_translations, dict):
        normalized: Dict[str, str] = {}
        for language in SUPPORTED_LANGUAGES:
            translated = clean_text(provided_translations.get(language))
            if translated:
                normalized[language] = translated
        return normalized

    source_language = description_language if description_language in SUPPORTED_LANGUAGES else "en"
    next_value = normalize_description_translations(existing_value)
    source_text = clean_text(description)

    if not source_text:
        next_value.pop(source_language, None)
        return next_value

    next_value[source_language] = source_text

    if source_language != "vi":
        return next_value

    try:
        translations = translate_vietnamese_description(source_text)
        for language in SUPPORTED_LANGUAGES:
            if language == "vi":
                continue
            translated = clean_text(translations.get(language))
            if translated:
                next_value[language] = translated
            else:
                next_value.pop(language, None)
    except Exception as exc:
        print(f"Vendor description translation failed: {exc}")

    return next_value


def recalc_vendor_rating(vendor_id: str, db):
    from models import FoodComment, FoodVendor
    comments = db.query(FoodComment).filter(FoodComment.vendor_id == vendor_id).all()
    count = len(comments)
    avg = round(sum(c.rating for c in comments) / count, 1) if count > 0 else 0.0
    vendor = db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first()
    if vendor:
        vendor.rating = avg
        vendor.reviews = count
        db.commit()
