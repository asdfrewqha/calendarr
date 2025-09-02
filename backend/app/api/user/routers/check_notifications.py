from typing import Annotated
from uuid import UUID

from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from app.database.adapter import adapter
from app.database.models import Message, User
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/check-notific/{msg_id}")
async def check_notifications(user: Annotated[User, Depends(check_user_token)], msg_id: UUID):
    msg = await adapter.get_by_id(Message, msg_id)
    if not msg:
        return emptyresponse(204)
    if msg.notification and user.notifications_bool:
        return emptyresponse(200)
    return emptyresponse(204)
