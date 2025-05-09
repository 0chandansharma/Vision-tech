# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the database URI from settings
DATABASE_URI = settings.SQLALCHEMY_DATABASE_URI
logger.info(f"Using database URI: {DATABASE_URI}")

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URI, 
    pool_pre_ping=True,
    echo=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()