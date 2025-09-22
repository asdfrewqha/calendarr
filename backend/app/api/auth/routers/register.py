from typing import Annotated

from app.api.auth.schemas import UserCreate
from app.api.auth.services import UserService
from fastapi import APIRouter, Depends

router = APIRouter()


@router.post("/register")
async def register_user(user: UserCreate, service: Annotated[UserService, Depends(UserService)]):
    return await service.register(user=user)
