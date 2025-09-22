from typing import Annotated

from app.api.auth.schemas import TokensTuple
from app.api.auth.services import UserService
from app.dependencies.responses import okresponse
from app.utils.cookies import get_tokens_cookies
from fastapi import APIRouter, Depends, status

router = APIRouter()


@router.get("/refresh", status_code=status.HTTP_200_OK)
async def refresh(
    service: Annotated[UserService, Depends(UserService)],
    tokens: Annotated[TokensTuple, Depends(get_tokens_cookies)],
):
    response = okresponse()
    access_token = await service.refresh(tokens)
    response.set_cookie(
        key="access_token", value=access_token, httponly=True, secure=True, samesite="None"
    )
    return response
