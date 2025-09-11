from typing import Annotated

from app.core.settings import settings
from app.database.adapter import adapter
from app.database.models import User
from app.database.session import get_async_session
from app.dependencies.responses import badresponse
from app.dependencies.telegram import validate_init_data
from app.utils.token_manager import TokenManager
from fastapi import APIRouter, Depends, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/login")
async def telegram_auth(
    session: Annotated[AsyncSession, Depends(get_async_session)], initData: str = Form(...)
):
    user_id = validate_init_data(initData, settings.bot_token.get_secret_value())
    if not user_id:
        return badresponse("Invalid initdata", 403)
    bd_user = await adapter.get_by_id(User, user_id, session=session)
    if not bd_user:
        return badresponse("User not found", 404)

    response = JSONResponse({"message": "success", "status": "success"})
    response.set_cookie(
        "access_token",
        TokenManager.create_token({"sub": str(bd_user.id)}),
        httponly=True,
        secure=True,
        samesite="none",
    )
    response.set_cookie(
        "refresh_token",
        TokenManager.create_token({"sub": str(bd_user.id)}, False),
        httponly=True,
        secure=True,
        samesite="none",
    )

    return response
