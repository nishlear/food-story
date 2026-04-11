from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Run migrations before create_all to handle columns added after initial deploy.
# Each statement is wrapped individually: SQLite raises on duplicate columns while
# PostgreSQL uses IF NOT EXISTS — catching per-statement handles both.
_MIGRATIONS = [
    "ALTER TABLE food_vendors ADD COLUMN owner_username TEXT",
    "ALTER TABLE food_streets ADD COLUMN lat_nw FLOAT",
    "ALTER TABLE food_streets ADD COLUMN lon_nw FLOAT",
    "ALTER TABLE food_streets ADD COLUMN lat_se FLOAT",
    "ALTER TABLE food_streets ADD COLUMN lon_se FLOAT",
    "ALTER TABLE food_streets ADD COLUMN map_image_path TEXT",
    "ALTER TABLE food_streets ADD COLUMN map_zoom INTEGER DEFAULT 19",
    "ALTER TABLE food_streets ADD COLUMN map_updated_at TEXT",
    "ALTER TABLE food_vendors ADD COLUMN lat FLOAT",
    "ALTER TABLE food_vendors ADD COLUMN lon FLOAT",
]

with engine.connect() as _conn:
    for _sql in _MIGRATIONS:
        try:
            _conn.execute(text(_sql))
            _conn.commit()
        except Exception:
            _conn.rollback()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
