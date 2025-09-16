from datetime import timedelta
from typing import Annotated
from uuid import UUID

from app.api.user.utils import find_next_weekday
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from app.utils.redis_adapter import redis_adapter
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/message/notification/{msg_id}")
async def check_notifications(
    user: Annotated[User, Depends(check_user_token)],
    msg_id: UUID,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    msg = await adapter.get_by_id(Message, msg_id, session=session)
    if not msg:
        return emptyresponse(204)
    if msg.notification and user.notifications_bool:
        payload = msg.payload if msg.payload else {}
        payload["name"] = msg.name
        payload["priority"] = msg.priority
        if msg.send_start:
            payload["start_notification"] = True
            await adapter.update_by_id(Message, msg_id, {"send_start": False})
        else:
            payload["start_notification"] = False
        if msg.repeat:
            if msg.repeat_date:
                await redis_adapter.publish(
                    "telegram_queue",
                    {"msg_id": msg_id, "user_id": user.id, "send_date": msg.repeat_date},
                )
                await adapter.update_by_id(Message, msg_id, {"repeat": False}, session)
            elif msg.repeat_wd:
                await redis_adapter.publish(
                    "telegram_queue",
                    {
                        "msg_id": msg_id,
                        "user_id": user.id,
                        "send_date": find_next_weekday(msg.repeat_wd)
                        + timedelta(msg.end_send_date.time()),
                    },
                )
        return payload
    return emptyresponse(204)
