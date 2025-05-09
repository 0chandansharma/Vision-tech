# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api import auth, users, projects, videos, detection
from app.core.config import settings
from app.db.session import engine
from app.db.base_class import Base

# Create tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Computer Vision Platform for Indian Police",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(videos.router, prefix=settings.API_V1_STR)
app.include_router(detection.router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Vision Tech API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)