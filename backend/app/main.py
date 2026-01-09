from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.users.routes import router as users_router
from app.deals.routes import router as deals_router
from app.activities.routes import router as activities_router
from app.memos.routes import router as memos_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.project_name)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)
app.include_router(deals_router)
app.include_router(activities_router)
app.include_router(memos_router)


@app.get("/")
def root():
    return {"message": "Deal Pipeline API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
