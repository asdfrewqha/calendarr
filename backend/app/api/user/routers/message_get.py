from typing import Annotated
from uuid import UUID

from app.api.user.schemas import MessageScheme
from app.api.user.services import MessageService
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/message/{msg_id}", response_model=MessageScheme)
async def list_message(
    user_id: Annotated[int, Depends(check_user_token)],
    service: Annotated[MessageService, Depends(MessageService)],
    msg_id: UUID,
):
    return await service.get_message(user_id, msg_id)
