from typing import Annotated
from uuid import UUID

from app.api.user.schemas import MessageUpdateScheme
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from app.dependencies.responses import okresponse
from app.utils.redis_adapter import redis_adapter
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.patch("/message/{msg_id}")
async def update_message(
    msg: MessageUpdateScheme,
    msg_id: UUID,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    msg_dict = MessageUpdateScheme.model_dump(msg, exclude_none=True, exclude_unset=True)
    await adapter.update_by_id(Message, msg_id, msg_dict, session)
    msg_obj = MessageUpdateScheme.model_validate(msg, from_attributes=True)
    msg_obj.event = "message_updated"
    msg_json = MessageUpdateScheme.model_dump_json(msg_obj)
    await redis_adapter.publish(f"messages:{user.id}", msg_json)
    return okresponse()
