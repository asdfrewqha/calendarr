from typing import Annotated

from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/user-notification/")
async def check_notifications(
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
):
    return await service.set_user_notifications(user_id)
