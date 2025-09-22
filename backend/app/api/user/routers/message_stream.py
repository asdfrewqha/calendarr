import json
from typing import Annotated, AsyncGenerator

from app.dependencies.checks import check_user_token
from app.dependencies.redis_dependency import RedisDependency
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

router = APIRouter()


async def event_generator(user_id: int, client) -> AsyncGenerator[str, None]:
    pubsub = client.pubsub()
    await pubsub.subscribe(f"messages:{user_id}")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    yield f"data: {json.dumps(message['data'], default=str)}\n\n"
                except (json.JSONDecodeError, TypeError):
                    yield f"data: {message['data'].decode('utf-8')}\n\n"
    finally:
        await pubsub.unsubscribe(f"messages:{user_id}")
        await pubsub.close()


@router.get("/message-stream")
async def message_stream(
    user_id: Annotated[int, Depends(check_user_token)],
    redis: Annotated[RedisDependency, Depends(RedisDependency)],
):
    async with redis.get_client() as client:
        return StreamingResponse(event_generator(user_id, client), media_type="text/event-stream")
