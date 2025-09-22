from typing import Annotated

from app.api.auth.schemas import TokensTuple
from app.dependencies.responses import okresponse
from app.utils.cookies import get_tokens_cookies
from fastapi import APIRouter, Depends, status

router = APIRouter()


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(cookies: Annotated[TokensTuple, Depends(get_tokens_cookies)]):
    response = okresponse()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
