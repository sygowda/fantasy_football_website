
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import jwt

router = APIRouter()

SECRET_KEY = "secret123"

class Player(BaseModel):
    id: int
    name: str
    position: str
    points: int = 0

players = []

def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=Player)
def add_player(player: Player, token: str = Depends(get_current_user)):
    if not token.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    players.append(player)
    return player

@router.get("/", response_model=List[Player])
def get_players():
    return players
