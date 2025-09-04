from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.api.user.schemas import MessageCreateScheme, CreatedMessageResponse
from app.api.user.tasks import schedule_telegram_message
from app.dependencies.checks import check_user_token
from typing import Annotated

router = APIRouter()


@router.post("/create-msg", response_model=CreatedMessageResponse)
async def create_message(
    msg: MessageCreateScheme,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    msg.user_id = user.id
    msg_dict = MessageCreateScheme.model_dump(msg)
    new_msg = await adapter.insert(Message, msg_dict, session)
    schedule_telegram_message(user.id, new_msg.id)
    return CreatedMessageResponse(id=new_msg.id)
