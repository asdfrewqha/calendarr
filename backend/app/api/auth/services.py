from typing import Annotated

from app.api.auth.schemas import InitData, TokensTuple, UserCreate
from app.core.settings import settings
from app.database.models import User
from app.dependencies.db_dependency import DBDependency
from app.dependencies.redis_dependency import RedisDependency
from app.dependencies.responses import okresponse
from app.dependencies.telegram import validate_init_data
from app.utils.token_manager import TokenManager
from fastapi import Depends
from fastapi.exceptions import HTTPException
from sqlalchemy import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select


class UserService:
    def __init__(
        self,
        model: Annotated[type[User], User],
        db: Annotated[DBDependency, Depends(DBDependency)],
        redis: Annotated[RedisDependency, Depends(RedisDependency)],
    ) -> None:
        self.db = db
        self.model = model
        self.redis = redis

    async def register(self, user: UserCreate):
        async with self.db.db_session() as session:
            query = insert(self.model).values(**user.model_dump()).returning(self.model)
            try:
                await session.execute(query)
            except IntegrityError:
                raise HTTPException(status_code=409, detail="User already exists")
            await session.commit()
        return okresponse()

    async def login(self, data: InitData):
        user_id = validate_init_data(data.initData, settings.bot_token.get_secret_value())
        if not user_id:
            raise HTTPException(status_code=403, detail="Invalid initData")
        async with self.db.db_session() as session:
            user = await session.execute(select(self.model).where(self.model.id == user_id))
            user = user.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            access_token = TokenManager.create_token({"sub": str(user_id)})
            refresh_token = TokenManager.create_token({"sub": str(user_id)}, False)
            async with self.redis.get_client() as redis:
                await redis.setex(
                    f"access_token:{access_token}",
                    settings.jwt_settings.access_token_expire_min * 60,
                    user_id,
                )
            return TokensTuple(access_token=access_token, refresh_token=refresh_token)

    async def refresh(self, tokens: TokensTuple):
        user_id = TokenManager.decode_token(tokens.refresh_token, False).get("sub")
        if not user_id:
            raise HTTPException(400, "Invalid token")
        async with self.db.db_session() as session:
            user = await session.execute(select(self.model).where(self.model.id == user_id))
            user = user.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            access_token = TokenManager.create_token({"sub": str(user_id)})
            async with self.redis.get_client() as redis:
                await redis.setex(
                    f"access_token:{access_token}",
                    settings.jwt_settings.access_token_expire_min * 60,
                    user_id,
                )
            return access_token
