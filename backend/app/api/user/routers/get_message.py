from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.api.user.schemas import MessageScheme
from app.dependencies.checks import check_user_token
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

router = APIRouter()


@router.get("/get-msg/{msg_id}", response_model=MessageScheme)
async def list_message(
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
    msg_id: UUID
):
    msg = await adapter.get_by_id(Message, msg_id, session)
    msg_sch = MessageScheme.model_validate(msg, from_attributes=True)
    if msg.end_date < datetime.now(timezone.utc):
        msg_sch.is_active = False
    return (msg_sch)
