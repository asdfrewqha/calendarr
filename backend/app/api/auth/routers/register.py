from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from app.database.adapter import adapter
from app.database.models import User
from app.database.session import get_async_session
from app.dependencies.responses import okresponse


router = APIRouter()


@router.post("/register")
async def register_user(
    id: int,
    name: Optional[str],
    username: Optional[str],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    user = await adapter.get_by_id(User, id, session)
    if user:
        return okresponse()
    await adapter.insert(User, {"id": id, "name": name, "username": username}, session=session)
    return okresponse()
