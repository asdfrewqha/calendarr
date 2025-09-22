from datetime import date, datetime, timezone
from typing import Annotated, Optional
from uuid import UUID, uuid4

from app.api.user.schemas import (
    CreatedMessageResponse,
    MessageCreateScheme,
    MessageScheme,
    MessageUpdateScheme,
    UserProfileResponse,
)
from app.core.taskiq.broker import source
from app.core.taskiq.tasks import send_telegram
from app.database.models import Message, User
from app.dependencies.db_dependency import DBDependency
from app.dependencies.redis_dependency import RedisDependency
from app.dependencies.responses import emptyresponse, okresponse
from fastapi import Depends
from fastapi.exceptions import HTTPException
from sqlalchemy import and_, or_, update
from sqlalchemy.future import select


class MessageService:
    user_model: Annotated[type[User], User]
    message_model: Annotated[type[Message], Message]

    def __init__(
        self,
        db: Annotated[DBDependency, Depends(DBDependency)],
        redis: Annotated[RedisDependency, Depends(RedisDependency)],
    ):
        self.db = db
        self.redis = redis

    async def create_message(self, message: MessageCreateScheme, user_id: int):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user.id == user_id))
            if user.scalar_one_or_none():
                message.user_id = user_id
                start_send_datetime = datetime.combine(
                    message.start_send_date, message.start_send_time, timezone.utc
                )
                new_msg_id = uuid4()
                schedule1 = await send_telegram.schedule_by_time(
                    source, start_send_datetime, new_msg_id, user.id
                )
                message.start_schedule_id = schedule1.schedule_id
                if message.end_send_date:
                    end_send_datetime = message.end_send_date
                    if message.end_send_time:
                        end_send_datetime = datetime.combine(
                            message.end_send_date, message.end_send_time, timezone.utc
                        )
                    schedule2 = await send_telegram.schedule_by_time(
                        source, end_send_datetime, new_msg_id, user.id
                    )
                    message.end_schedule_id = schedule2.schedule_id
                    message.send_end = True
                if message.repeat:
                    pass
                message_dict = message.model_dump(exclude_none=True, exclude_unset=True)
                record = self.message(**message_dict)
                session.add(record)
                await session.commit
                await session.refresh(record)
                msg_obj = MessageCreateScheme.model_validate(record)
                msg_obj.event = "message_created"
                msg_json = MessageCreateScheme.model_dump_json(
                    msg_obj, exclude_none=True, exclude_unset=True
                )
                async with self.redis.get_client() as client:
                    await client.publish(f"messages:{user_id}", msg_json)
                return CreatedMessageResponse(id=record.id)
            raise HTTPException(404, "User not found")

    async def list_messages(self, user_id: int, start_date: date, end_date: Optional[date] = None):
        async with self.db.db_session() as session:
            if not end_date:
                query = (
                    select(self.message)
                    .where(self.message.user_id == user_id)
                    .where(
                        or_(
                            self.message.start_send_date == start_date,
                            self.message.end_send_date == start_date,
                            and_(
                                self.message.start_send_date < start_date,
                                self.message.end_send_date > start_date,
                            ),
                        )
                    )
                )
            else:
                query = (
                    select(self.message)
                    .where(self.message.user_id == user_id)
                    .where(
                        or_(
                            self.message.start_send_date == start_date,
                            self.message.start_send_date == end_date,
                            self.message.end_send_date == start_date,
                            self.message.end_send_date == end_date,
                            and_(
                                self.message.start_send_date < start_date,
                                self.message.end_send_date > end_date,
                            ),
                        )
                    )
                )
            result = await session.execute(query)
            return result.scalars().all()

    async def get_message(self, user_id: int, msg_id: UUID):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user.id == user_id))
            if user.scalar_one_or_none():
                message = await session.execute(
                    select(self.message).where(self.message.id == msg_id)
                )
                message = message.scalar_one_or_none()
                if message:
                    if message.user_id == user_id:
                        return MessageScheme.model_validate(message, from_attributes=True)
                    else:
                        raise HTTPException(403)
                raise HTTPException(404, "Not found")
            raise HTTPException(404, "User not found")

    async def delete_message(self, msg_id: UUID, user_id: int):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user.id == user_id))
            if user.scalar_one_or_none:
                message = await session.execute(
                    select(self.message).where(self.message.id == msg_id)
                )
                message = message.scalar_one_or_none()
                if message:
                    if message.user_id == user_id:
                        await source.delete_schedule(message.start_schedule_id)
                        if message.end_schedule_id:
                            await source.delete_schedule(message.end_schedule_id)
                        await session.delete(message)
                        await session.commit()
                        async with self.redis.get_client() as client:
                            await client.publish(
                                f"messages:{user_id}",
                                {"event": "message_deleted", "id": str(msg_id)},
                            )
                        return emptyresponse()
                    raise HTTPException(403)
                raise HTTPException(404, "Not found")
            raise HTTPException(404, "User not found")

    async def update_message(self, message_upd: MessageUpdateScheme, msg_id: UUID, user_id: int):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user.id == user_id))
            if user.scalar_one_or_none():
                message = await session.execute(select(self.message).where(self.message == msg_id))
                message = message.scalar_one_or_none()
                if message:
                    if message.user_id == user_id:
                        message_upd.event = "message_updated"
                        if message_upd.start_send_date or message_upd.start_send_time:
                            await source.delete_schedule(message.start_schedule_id)
                            start_date = (
                                message_upd.start_send_date
                                if message_upd.start_send_date
                                else message.start_send_date
                            )
                            start_time = (
                                message_upd.start_send_time
                                if message_upd.start_send_time
                                else message.start_send_time
                            )
                            start_datetime = datetime.combine(start_date, start_time, timezone.utc)
                            schedule1 = await send_telegram.schedule_by_time(
                                source, start_datetime, msg_id, user.id
                            )
                            message_upd.start_schedule_id = schedule1
                        if message_upd.end_send_date or message_upd.end_send_time:
                            await source.delete_schedule(message.end_schedule_id)
                            end_date = (
                                message_upd.end_send_date
                                if message_upd.end_send_date
                                else message.end_send_date
                            )
                            end_time = (
                                message_upd.end_send_time
                                if message_upd.end_send_time
                                else message.end_send_time
                            )
                            end_datetime = datetime.combine(end_date, end_time, timezone.utc)
                            schedule2 = await send_telegram.schedule_by_time(
                                source, end_datetime, msg_id, user.id
                            )
                            message_upd.end_schedule_id = schedule2
                        await session.execute(
                            update(self.message)
                            .where(self.message.id == msg_id)
                            .values(**message_upd.model_dump(exclude_none=True, exclude_unset=True))
                        )
                        await session.commit()
                        async with self.redis.get_client() as client:
                            await client.publish(
                                f"messages:{user_id}",
                                message_upd.model_dump_json(exclude_none=True, exclude_unset=True),
                            )
                        return okresponse()
                    raise HTTPException(403)
                raise HTTPException(404, "Not found")
            raise HTTPException(404, "User not found")

    async def profile(self, user_id: int):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user.id == user_id))
            user = user.scalar_one_or_none()
            return UserProfileResponse.model_validate(user, from_attributes=True)

    async def set_user_notifications(self, user_id: int):
        async with self.db.db_session() as session:
            user = await session.execute(select(self.user).where(self.user == user_id))
            user = user.scalar_one_or_none()
            await session.execute(
                update(self.message)
                .where(self.message.id == user_id)
                .values(notifications_bool=not user.notifications_bool)
            )
            await session.commit()
            return emptyresponse(200)
