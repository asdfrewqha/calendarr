from typing import Annotated

from app.api.user.schemas import CreatedMessageResponse, MessageCreateScheme
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from app.utils.redis_adapter import redis_adapter
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/message", response_model=CreatedMessageResponse)
async def create_message(
    msg: MessageCreateScheme,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    msg.user_id = user.id
    if msg.start_send_date:
        msg.send_start = True
    msg_dict = MessageCreateScheme.model_dump(msg, exclude_none=True, exclude_unset=True)
    new_msg = await adapter.insert(Message, msg_dict, session)
    await redis_adapter.publish(
        "telegram_queue", {"msg_id": new_msg.id, "user_id": user.id, "send_date": msg.end_send_date}
    )
    if msg.start_send_date:
        await redis_adapter.publish(
            "telegram_queue",
            {"msg_id": new_msg.id, "user_id": user.id, "send_date": msg.start_send_date},
        )
    msg_obj = MessageCreateScheme.model_validate(new_msg, from_attributes=True)
    msg_obj.event = "message_created"
    msg_json = MessageCreateScheme.model_dump_json(msg_obj)
    await redis_adapter.publish(f"messages:{user.id}", msg_json)
    return CreatedMessageResponse(id=new_msg.id)
