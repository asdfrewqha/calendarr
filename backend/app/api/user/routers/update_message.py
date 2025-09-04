from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.api.user.schemas import MessageUpdateScheme
from app.dependencies.checks import check_user_token
from app.dependencies.responses import okresponse
from typing import Annotated
from uuid import UUID

router = APIRouter()


@router.post("/update-msg/{msg_id}")
async def update_message(
    msg: MessageUpdateScheme,
    msg_id: UUID,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    msg_dict = MessageUpdateScheme.model_dump(msg, exclude_none=True, exclude_unset=True)
    await adapter.update_by_id(Message, msg_id, msg_dict, session)
    return okresponse()
