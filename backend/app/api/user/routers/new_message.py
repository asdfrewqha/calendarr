from typing import Annotated

from app.api.user.schemas import CreatedMessageResponse, MessageCreateScheme
from app.api.user.tasks import schedule_telegram_message
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/create-msg", response_model=CreatedMessageResponse)
async def create_message(
    msg: MessageCreateScheme,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    msg.user_id = user.id
    if msg.start_send_date:
        msg.send_start = True
    msg_dict = MessageCreateScheme.model_dump(msg)
    new_msg = await adapter.insert(Message, msg_dict, session)
    schedule_telegram_message.apply_async(args=[user.id, new_msg.id], eta=msg.end_send_date)
    if msg.start_send_date:
        schedule_telegram_message.apply_async(args=[user.id, new_msg.id], eta=msg.start_send_date)
    return CreatedMessageResponse(id=new_msg.id)
