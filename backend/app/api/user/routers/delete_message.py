from typing import Annotated
from uuid import UUID

from app.api.user.schemas import MessageScheme
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.delete("/del-msg/{msg_id}", response_model=MessageScheme)
async def list_message(
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
    msg_id: UUID,
):
    await adapter.delete(Message, msg_id, session)
    return emptyresponse()
