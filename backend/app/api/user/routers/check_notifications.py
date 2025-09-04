from typing import Annotated
from uuid import UUID

from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/check-notific/{msg_id}")
async def check_notifications(
    user: Annotated[User, Depends(check_user_token)],
    msg_id: UUID,
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    msg = await adapter.get_by_id(Message, msg_id, session=session)
    if not msg:
        return emptyresponse(204)
    if msg.notification and user.notifications_bool:
        payload = msg.payload
        payload["name"] = msg.name
        payload["priority"] = msg.priority
        return payload
    return emptyresponse(204)
