from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

class Player(BaseModel):
    id: str
    name: str
    position: str
    price: Optional[float] = 0.0
    points_history: List[float] = []
    last_3: List[float] = []
    created_at: Optional[str] = None
    points: Optional[int] = 0
    goals_scored: Optional[int] = 0
    assists: Optional[int] = 0
    clean_sheets: Optional[int] = 0

# Sample players data - This will be used to initialize the database if needed
SAMPLE_PLAYERS = [
    {
        "id": "1",
        "name": "Alisson",
        "position": "goalkeeper",
        "price": 5.5,
        "points_history": [],
        "last_3": [],
        "points": 120,
        "goals_scored": 0,
        "assists": 0,
        "clean_sheets": 15
    },
    {
        "id": "2",
        "name": "Ederson",
        "position": "goalkeeper",
        "price": 5.5,
        "points_history": [],
        "last_3": [],
        "points": 115,
        "goals_scored": 0,
        "assists": 1,
        "clean_sheets": 14
    },
    {
        "id": "3",
        "name": "Virgil van Dijk",
        "position": "defender",
        "price": 6.5,
        "points_history": [],
        "last_3": [],
        "points": 130,
        "goals_scored": 3,
        "assists": 2,
        "clean_sheets": 12
    },
    {
        "id": "4",
        "name": "Ruben Dias",
        "position": "defender",
        "price": 6.0,
        "points_history": [],
        "last_3": [],
        "points": 125,
        "goals_scored": 2,
        "assists": 1,
        "clean_sheets": 13
    },
    {
        "id": "5",
        "name": "Trent Alexander-Arnold",
        "position": "defender",
        "price": 7.5,
        "points_history": [],
        "last_3": [],
        "points": 140,
        "goals_scored": 2,
        "assists": 10,
        "clean_sheets": 10
    },
    {
        "id": "6",
        "name": "João Cancelo",
        "position": "defender",
        "price": 7.0,
        "points_history": [],
        "last_3": [],
        "points": 135,
        "goals_scored": 1,
        "assists": 8,
        "clean_sheets": 11
    },
    {
        "id": "7",
        "name": "Erling Haaland",
        "position": "forward",
        "price": 12.0,
        "points_history": [],
        "last_3": [],
        "points": 180,
        "goals_scored": 25,
        "assists": 3,
        "clean_sheets": 0
    },
    {
        "id": "8",
        "name": "Mohamed Salah",
        "position": "forward",
        "price": 12.5,
        "points_history": [],
        "last_3": [],
        "points": 175,
        "goals_scored": 20,
        "assists": 8,
        "clean_sheets": 0
    },
    {
        "id": "9",
        "name": "Harry Kane",
        "position": "forward",
        "price": 11.0,
        "points_history": [],
        "last_3": [],
        "points": 170,
        "goals_scored": 22,
        "assists": 5,
        "clean_sheets": 0
    },
    {
        "id": "10",
        "name": "Son Heung-min",
        "position": "forward",
        "price": 9.5,
        "points_history": [],
        "last_3": [],
        "points": 160,
        "goals_scored": 18,
        "assists": 7,
        "clean_sheets": 0
    },
    {
        "id": "11",
        "name": "Kevin De Bruyne",
        "position": "forward",
        "price": 10.5,
        "points_history": [],
        "last_3": [],
        "points": 165,
        "goals_scored": 8,
        "assists": 15,
        "clean_sheets": 0
    }
]

@router.get("/players", response_model=List[Player])
async def get_players(user=Depends(get_current_user)):
    """
    Get all available players from the database.
    If no players exist, initialize the database with sample players.
    Requires authentication.
    """
    # Try to get players from the database
    response = supabase.from_("players").select("*").execute()
    
    # If no players exist, initialize the database with sample players
    if not response.data or len(response.data) == 0:
        print("Initializing players database with sample data")
        supabase.from_("players").insert(SAMPLE_PLAYERS).execute()
        return SAMPLE_PLAYERS
    
    # Add default values for missing fields
    players = []
    for player in response.data:
        player_data = {
            "id": player["id"],
            "name": player["name"],
            "position": player["position"],
            "price": player.get("price", 0.0),
            "points_history": player.get("points_history", []),
            "last_3": player.get("last_3", []),
            "created_at": player.get("created_at"),
            "points": player.get("points"),
            "goals_scored": player.get("goals_scored"),
            "assists": player.get("assists"),
            "clean_sheets": player.get("clean_sheets")
        }
        players.append(player_data)
    
    return players 