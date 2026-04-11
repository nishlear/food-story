import uuid
from datetime import datetime

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base, SessionLocal


class FoodStreet(Base):
    __tablename__ = "food_streets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String)
    description = Column(Text, nullable=True)
    lat_nw = Column(Float, nullable=True)
    lon_nw = Column(Float, nullable=True)
    lat_se = Column(Float, nullable=True)
    lon_se = Column(Float, nullable=True)
    map_image_path = Column(Text, nullable=True)
    map_zoom = Column(Integer, default=19)
    map_updated_at = Column(String, nullable=True)

    vendors = relationship(
        "FoodVendor", back_populates="street", cascade="all, delete-orphan"
    )


class FoodVendor(Base):
    __tablename__ = "food_vendors"

    id = Column(String, primary_key=True, index=True)
    street_id = Column(String, ForeignKey("food_streets.id", ondelete="CASCADE"))
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    x = Column(Float)
    y = Column(Float)
    type = Column(String)
    address = Column(String, nullable=True)
    images = Column(Text, nullable=True)  # Stored as JSON string
    owner_username = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    street = relationship("FoodStreet", back_populates="vendors")
    comments = relationship("FoodComment", back_populates="vendor", cascade="all, delete-orphan")


class AppUser(Base):
    __tablename__ = "app_users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    created_at = Column(String)


class FoodComment(Base):
    __tablename__ = "food_comments"

    id = Column(String, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("food_vendors.id", ondelete="CASCADE"))
    username = Column(String)
    rating = Column(Integer)
    body = Column(Text)
    created_at = Column(String)

    vendor = relationship("FoodVendor", back_populates="comments")


# Finalize schema after all models are defined
from database import Base, engine  # noqa: E402
Base.metadata.create_all(bind=engine)


def seed_users(db):
    if db.query(AppUser).count() == 0:
        now = datetime.utcnow().isoformat()
        for username, role in [("user", "user"), ("foodvendor", "foodvendor"), ("admin", "admin")]:
            db.add(AppUser(
                id=str(uuid.uuid4()),
                username=username,
                password="123123",
                role=role,
                created_at=now,
            ))
        db.commit()


with SessionLocal() as _seed_db:
    seed_users(_seed_db)
