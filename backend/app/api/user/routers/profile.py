from typing import Annotated

from app.api.user.schemas import UserProfileResponse
from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/profile", response_model=UserProfileResponse)
async def profile(
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
):
    return service.profile(user_id)
