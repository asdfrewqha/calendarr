from typing import AsyncGenerator

from app.database.models import User
from app.dependencies.checks import check_user_token
from app.utils.redis_adapter import redis_adapter
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

router = APIRouter()


async def event_generator(user_id: int) -> AsyncGenerator[str, None]:
    async for message in redis_adapter.subscribe(f"messages:{user_id}"):
        yield f"data: {message}\n\n"


@router.get("/message-stream")
async def message_stream(user: User = Depends(check_user_token)):
    return StreamingResponse(event_generator(user.id), media_type="text/event-stream")
