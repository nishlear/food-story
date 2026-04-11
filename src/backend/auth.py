import base64
from typing import Optional

from fastapi import Header, HTTPException


def get_user_from_token(token: str) -> Optional[dict]:
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        parts = decoded.split(":")
        role = parts[0]
        username = ":".join(parts[1:])
        if role in ("user", "foodvendor", "admin"):
            return {"role": role, "username": username}
        return None
    except Exception:
        return None


def get_role_from_token(token: str) -> Optional[str]:
    user = get_user_from_token(token)
    return user["role"] if user else None


def require_authenticated(x_role_token: Optional[str] = Header(default=None)) -> dict:
    if not x_role_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = get_user_from_token(x_role_token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


def require_admin(x_role_token: Optional[str] = Header(default=None)) -> dict:
    user = require_authenticated(x_role_token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


def require_vendor_or_admin(x_role_token: Optional[str] = Header(default=None)) -> dict:
    user = require_authenticated(x_role_token)
    if user["role"] not in ("admin", "foodvendor"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return user
