from fastapi import APIRouter, Depends
from app.models.schemas import UserCreate, UserLogin, Token
from app.services.auth_service import (
    register_user, authenticate_user, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(data: UserCreate):
    user = register_user(data.name, data.email, data.password)
    token = create_access_token({"sub": user["email"], "name": user["name"]})
    return Token(access_token=token, user=user)


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    user = authenticate_user(data.email, data.password)
    token = create_access_token({"sub": user["email"], "name": user["name"]})
    return Token(access_token=token, user=user)


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
