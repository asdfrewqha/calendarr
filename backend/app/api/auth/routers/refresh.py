from typing import Annotated

from app.core.logging import get_logger
from app.database.models import User
from app.dependencies.checks import check_refresh
from app.utils.token_manager import TokenManager
from fastapi import APIRouter, Depends, Response, status

logger = get_logger()
router = APIRouter()


@router.get("/refresh", status_code=status.HTTP_200_OK)
async def refresh(response: Response, user: Annotated[User, Depends(check_refresh)]):
    access_token = TokenManager.create_token(
        {"sub": int(user.id), "type": "access"},
        TokenManager.ACCESS_TOKEN_EXPIRE_MINUTES,
    )

    response.set_cookie(
        key="access_token", value=access_token, httponly=True, secure=True, samesite="None"
    )

    return {"message": "Token refreshed successfully", "user_id": user.id}
