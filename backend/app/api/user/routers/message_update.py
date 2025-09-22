from typing import Annotated
from uuid import UUID

from app.api.user.schemas import MessageUpdateScheme
from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.patch("/message/{msg_id}")
async def update_message(
    msg: MessageUpdateScheme,
    msg_id: UUID,
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
):
    return await service.update_message(msg, msg_id, user_id)
