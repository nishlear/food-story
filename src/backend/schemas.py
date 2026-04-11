from typing import Dict, List, Optional

from pydantic import BaseModel


class FoodVendorBase(BaseModel):
    name: str
    description: Optional[str] = None
    description_language: str = "en"
    description_translations: Optional[Dict[str, str]] = None
    rating: float = 0.0
    reviews: int = 0
    x: float
    y: float
    type: str
    address: Optional[str] = None
    images: Optional[List[str]] = []
    owner_username: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class FoodVendorCreate(FoodVendorBase):
    id: Optional[str] = None


class FoodVendorResponse(FoodVendorBase):
    id: str
    street_id: str
    description_translations: Dict[str, str] = {}

    class Config:
        from_attributes = True


class FoodStreetBase(BaseModel):
    name: str
    city: str
    description: Optional[str] = None
    lat_nw: Optional[float] = None
    lon_nw: Optional[float] = None
    lat_se: Optional[float] = None
    lon_se: Optional[float] = None
    map_zoom: int = 19


class FoodStreetCreate(FoodStreetBase):
    id: Optional[str] = None


class FoodStreetResponse(FoodStreetBase):
    id: str
    vendors_count: int = 0
    map_image_path: Optional[str] = None
    map_updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


class CommentCreate(BaseModel):
    rating: int
    body: str


class CommentResponse(BaseModel):
    id: str
    vendor_id: str
    username: str
    rating: int
    body: str
    created_at: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    created_at: str

    class Config:
        from_attributes = True


class AdminUpdateUserRequest(BaseModel):
    role: str


class AdminUpdateVendorOwnerRequest(BaseModel):
    owner_username: Optional[str] = None


class VendorEditRequest(BaseModel):
    name: str
    description: Optional[str] = None
    description_language: str = "en"
    images: Optional[List[str]] = []
