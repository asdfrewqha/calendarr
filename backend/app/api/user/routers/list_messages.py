from datetime import date, datetime, time, timezone
from typing import Annotated, Optional

from app.api.user.schemas import MessageScheme
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.dependencies.checks import check_user_token
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/list-msg")
async def list_message(
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)],
    start_date: date = Query(...),
    end_date: Optional[date] = Query(None),
):
    if start_date:
        start_date = datetime.combine(start_date, time()).replace(tzinfo=timezone.utc)
    if end_date:
        end_date = datetime.combine(end_date, time(23, 59, 59)).replace(tzinfo=timezone.utc)
        list_messages = await adapter.get_by_cond(
            Message,
            "end_send_date",
            start_date,
            ">=",
            "end_send_date",
            end_date,
            "<=",
            "user_id",
            user.id,
            "==",
            session=session,
        )
    else:
        end_date = datetime.combine(start_date, time(23, 59, 59)).replace(tzinfo=timezone.utc)
        list_messages = await adapter.get_by_cond(
            Message,
            "end_send_date",
            start_date,
            ">=",
            "end_send_date",
            end_date,
            "<=",
            "user_id",
            user.id,
            "==",
            session=session,
        )
    response = []
    current_time = datetime.now(timezone.utc)

    for msg in list_messages:
        msg_sch = MessageScheme.model_validate(msg, from_attributes=True)
        if msg.end_send_date.replace(tzinfo=timezone.utc) < current_time:
            msg_sch.is_active = False
        else:
            msg_sch.is_active = True
        response.append(msg_sch)

    return response
