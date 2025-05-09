# app/db/session.py (temporary fix for debugging)
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Hardcoded URI for debugging
DATABASE_URI = "postgresql://postgres:postgres@localhost/visiontech"
print(f"Using database URI: {DATABASE_URI}")

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URI, 
    pool_pre_ping=True,
    echo=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# Define function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()