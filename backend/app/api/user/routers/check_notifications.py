from typing import Annotated
from datetime import timedelta
from uuid import UUID

from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.api.user.tasks import schedule_telegram_message
from app.api.user.utils import find_next_weekday
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
        payload["start_notification"] = True if msg.priority else False
        if msg.repeat:
            if msg.repeat_date:
                schedule_telegram_message.apply_async(args={user.id, msg.id}, eta=msg.repeat_date)
                if msg.start_date:
                    schedule_telegram_message.apply_async(args={user.id, msg.id}, eta=msg.repeat_date + timedelta(hours=24))
            elif msg.repeat_wd:
                schedule_telegram_message.apply_async(args={user.id, msg.id}, eta=find_next_weekday(msg.repeat_wd))
        return payload
    return emptyresponse(204)
