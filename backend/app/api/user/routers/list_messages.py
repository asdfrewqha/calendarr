from fastapi import APIRouter, Depends
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.adapter import adapter
from app.database.models import Message, User
from app.database.session import get_async_session
from app.api.user.schemas import MessageScheme, ListRequestScheme
from app.dependencies.checks import check_user_token
from typing import Annotated, List, Optional

router = APIRouter()


@router.get("/list-msg", response_model=List[Optional[MessageScheme]])
async def list_message(
    dates: ListRequestScheme,
    user: Annotated[User, Depends(check_user_token)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    start_date = datetime.combine(dates.start_date, time())
    if dates.end_date:
        end_date = datetime.combine(dates.end_date, time(23, 59, 59))
        list_messages = await adapter.get_by_cond(Message, "end_send_date", ">=", start_date, "end_send_date", "<=", end_date, "user_id", "==", user.id, session=session)
    else:
        end_date = datetime.combine(dates.start_date, time(23, 59, 59))
        list_messages = await adapter.get_by_cond(Message, "end_send_date", ">=", start_date, "end_send_date", "<=", end_date, "user_id", "==", user.id, session=session)
    response = []
    for msg in list_messages:
        response.append(MessageScheme.model_dump(msg))
    return response
