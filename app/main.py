from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import tasks
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup (In production, use Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup logic if needed

app = FastAPI(title="Solo Leveling System API", version="2.0.0", lifespan=lifespan)

app.include_router(tasks.router)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://solo-leveling-system-v2-frontend.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "System Online",
        "rank": "S-Class",
        "timestamp": "Synchronized"
    }
