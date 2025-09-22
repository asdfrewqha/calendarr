from typing import Annotated

from app.api.user.schemas import CreatedMessageResponse, MessageCreateScheme
from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.post("/message", response_model=CreatedMessageResponse)
async def create_message(
    msg: MessageCreateScheme,
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
):
    return await service.create_message(msg, user_id)
