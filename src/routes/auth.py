from fastapi import APIRouter, Request, HTTPException, Depends
from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service role key is needed to insert
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_current_user(request: Request):
    try:
        # Get the authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Extract the token
        token = auth_header.split(" ")[1]
        
        # Verify the token with Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@router.post("/sync-user")
async def sync_user(request: Request):
    try:
        body = await request.json()
        
        # Validate required fields
        if "id" not in body:
            raise HTTPException(status_code=422, detail="Missing required field: id")
        if "full_name" not in body:
            raise HTTPException(status_code=422, detail="Missing required field: full_name")
        if "email" not in body:
            raise HTTPException(status_code=422, detail="Missing required field: email")
            
        user_id = body.get("id")
        full_name = body.get("full_name")
        email = body.get("email")
        
        # Log the received data
        print(f"Received user data: id={user_id}, full_name={full_name}, email={email}")

        # Insert only if user doesn't already exist
        existing = supabase.table("users").select("*").eq("id", user_id).execute()
        if existing.data:
            return {"message": "User already exists"}

        result = supabase.table("users").insert({
            "id": user_id,
            "full_name": full_name,
            "username": email,  # Store email as username
            "role": "user"
        }).execute()
        
        return {"message": "User inserted", "data": result.data}
    except Exception as e:
        print(f"Error in sync_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/login")
async def login(request: Request):
    try:
        body = await request.json()
        
        # Validate required fields
        if "email" not in body:
            raise HTTPException(status_code=422, detail="Missing required field: email")
        if "password" not in body:
            raise HTTPException(status_code=422, detail="Missing required field: password")
            
        email = body.get("email")
        password = body.get("password")
        
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # The response is directly the user data in Python client
        if not auth_response:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        user_id = auth_response.user.id
        
        # Check if user exists in our database
        user_data = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found in database")
            
        return {
            "message": "Login successful",
            "user": user_data.data[0]
        }
        
    except Exception as e:
        print(f"Error in login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    """
    Get a user by their ID.
    """
    try:
        # Query the users table for the specified user ID
        response = supabase.from_("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
