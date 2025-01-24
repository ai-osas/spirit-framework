from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import conversations, patterns

app = FastAPI(
    title="Spirit Framework API",
    description="AI-powered learning pattern recognition system",
    version="0.1.0"
)

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conversations.router, prefix="/api/v1/conversations")
app.include_router(patterns.router, prefix="/api/v1/patterns")

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Spirit Framework API",
        "description": "Mapping the constellations of human learning"
    }