from typing import Annotated
from uuid import UUID

from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.delete("/message/{msg_id}")
async def list_message(
    user_id: Annotated[int, Depends(check_user_token)],
    msg_id: UUID,
    service: Annotated[MessageService, Depends(MessageService)],
):
    return await service.delete_message(msg_id=msg_id, user_id=user_id)
