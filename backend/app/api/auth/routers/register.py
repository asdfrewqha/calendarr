from typing import Annotated

from app.api.auth.schemas import UserCreate
from app.api.auth.services import UserService
from fastapi import APIRouter, Depends

router = APIRouter()


@router.post("/register")
async def register_user(
    service: Annotated[UserService, Depends(UserService)],
    id: int,
    name: str = None,
    username: str = None,
):
    user = UserCreate(id=id, name=name, username=username)
    return await service.register(user=user)
