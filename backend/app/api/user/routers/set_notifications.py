from typing import Annotated

from app.database.adapter import adapter
from app.database.models import User
from app.dependencies.checks import check_user_token
from app.dependencies.responses import emptyresponse
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/set-notific/")
async def check_notifications(user: Annotated[User, Depends(check_user_token)]):
    await adapter.update_by_id(User, user.id, {"notifications_bool": not user.notifications_bool})
    return emptyresponse(200)
