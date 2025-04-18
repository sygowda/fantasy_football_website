from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import create_client
from .auth import get_current_user
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

# Load environment variables
load_dotenv()

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

class PlayerDetail(BaseModel):
    id: str
    name: str
    position: str
    price: float
    points: Optional[int] = 0
    goals_scored: Optional[int] = 0
    assists: Optional[int] = 0
    clean_sheets: Optional[int] = 0

class TeamDetail(BaseModel):
    id: str
    user_id: str
    player_ids: List[str]
    players: List[PlayerDetail]

@router.get("/team", response_model=Optional[TeamDetail])
def get_user_team(user=Depends(get_current_user)):
    user_id = user.id
    try:
        # First try to get the team without using .single()
        response = supabase.from_("user_teams").select("*").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            print(response.data)
            team_data = response.data[0]
            
            # Get player details for each player ID
            player_ids = team_data.get("player_ids", [])
            if player_ids:
                players_response = supabase.from_("players").select("*").in_("id", player_ids).execute()
                # Add default values for missing fields
                players = []
                for player in players_response.data:
                    players.append({
                        "id": player["id"],
                        "name": player["name"],
                        "position": player["position"],
                        "price": player.get("price", 0.0),  # Default price if missing
                        "points": player.get("points", 0),
                        "goals_scored": player.get("goals_scored", 0),
                        "assists": player.get("assists", 0),
                        "clean_sheets": player.get("clean_sheets", 0)
                    })
            else:
                players = []
            
            # Combine team data with player details
            team_data["players"] = players
            return team_data
        else:
            return None
    except Exception as e:
        print(f"Error fetching team: {str(e)}")
        return None

@router.post("/team")
async def create_team(request: Request, user=Depends(get_current_user)):
    user_id = user.id
    
    try:
        # Check if user already has a team
        existing_response = supabase.from_("user_teams").select("*").eq("user_id", user_id).execute()
        
        if existing_response.data and len(existing_response.data) > 0:
            raise HTTPException(status_code=400, detail="User already has a team")
        
        # Get player IDs from request body
        body = await request.json()
        player_ids = body.get("player_ids", [])
        
        # Create new team with player IDs
        new_team = {
            "user_id": user_id,
            "player_ids": player_ids
        }
        
        response = supabase.from_("user_teams").insert(new_team).execute()
        
        if response.data and len(response.data) > 0:
            team_data = response.data[0]
            
            # Get player details for the newly created team
            if player_ids:
                players_response = supabase.from_("players").select("*").in_("id", player_ids).execute()
                # Add default values for missing fields
                players = []
                for player in players_response.data:
                    players.append({
                        "id": player["id"],
                        "name": player["name"],
                        "position": player["position"],
                        "price": player.get("price", 0.0),  # Default price if missing
                        "points": player.get("points", 0),
                        "goals_scored": player.get("goals_scored", 0),
                        "assists": player.get("assists", 0),
                        "clean_sheets": player.get("clean_sheets", 0)
                    })
            else:
                players = []
            
            # Combine team data with player details
            team_data["players"] = players
            return {"team": team_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to create team")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error creating team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create team: {str(e)}")

@router.put("/team")
async def update_team(request: Request, user=Depends(get_current_user)):
    user_id = user.id
    
    try:
        # Check if user has a team
        existing_response = supabase.from_("user_teams").select("*").eq("user_id", user_id).execute()
        
        if not existing_response.data or len(existing_response.data) == 0:
            raise HTTPException(status_code=404, detail="No team found for user")
        
        # Get player IDs from request body
        body = await request.json()
        player_ids = body.get("player_ids", [])
        
        # Update team with new player IDs
        response = supabase.from_("user_teams").update({
            "player_ids": player_ids
        }).eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            team_data = response.data[0]
            
            # Get player details for the updated team
            if player_ids:
                players_response = supabase.from_("players").select("*").in_("id", player_ids).execute()
                # Add default values for missing fields
                players = []
                for player in players_response.data:
                    players.append({
                        "id": player["id"],
                        "name": player["name"],
                        "position": player["position"],
                        "price": player.get("price", 0.0),  # Default price if missing
                        "points": player.get("points", 0),
                        "goals_scored": player.get("goals_scored", 0),
                        "assists": player.get("assists", 0),
                        "clean_sheets": player.get("clean_sheets", 0)
                    })
            else:
                players = []
            
            # Combine team data with player details
            team_data["players"] = players
            return {"team": team_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to update team")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update team: {str(e)}")
