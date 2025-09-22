from typing import Annotated

from app.api.auth.schemas import TokensTuple
from app.core.logging.logging import get_logger
from app.dependencies.redis_dependency import RedisDependency
from app.utils.cookies import get_tokens_cookies
from app.utils.token_manager import TokenManager
from fastapi import Depends
from fastapi.exceptions import HTTPException

logger = get_logger()


async def check_user_token(
    tokens: Annotated[TokensTuple, Depends(get_tokens_cookies)],
    redis: Annotated[RedisDependency, Depends(RedisDependency)],
) -> int:
    async with redis.get_client() as client:
        user_id = client.get(f"access_token:{tokens.access_token}")
    if not user_id:
        data = TokenManager.decode_token(tokens.access_token)
        user_id = data.get("sub")
        if not user_id:
            logger.error("No user for this token")
            raise HTTPException(401, "No user for this token")
    return int(user_id)
