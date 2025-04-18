from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.team import router as team_router
from routes.players import router as players_router

app = FastAPI(title="Fantasy Football API")

# CORS setup (adjust for security)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)
app.include_router(team_router)
app.include_router(players_router)
