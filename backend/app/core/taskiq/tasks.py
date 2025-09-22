from typing import Annotated
from uuid import UUID

from app.core.logging.logging import get_logger
from app.core.taskiq.broker import broker
from app.database.models import Message
from app.dependencies.db_dependency import DBDependency
from app.dependencies.redis_dependency import RedisDependency
from sqlalchemy import update
from sqlalchemy.future import select
from taskiq import TaskiqDepends


@broker.task
async def send_telegram(
    msg_id: UUID,
    user_id: int,
    db: Annotated[DBDependency, TaskiqDepends(DBDependency)],
    redis: Annotated[RedisDependency, TaskiqDepends(RedisDependency)],
):
    async with db.db_session() as session:
        logger = get_logger()
        msg = await session.execute(select(Message).where(Message.id == msg_id))
        msg = msg.scalar_one_or_none()
        if msg:
            if msg.send_start:
                start = True
                await session.execute(
                    update(Message).where(Message.id == msg_id).values(send_start=False)
                )
            header = f"<b>{msg.name}</b>\n" if msg.name else ""
            priority_text = f"Приоритет: {msg.priority}\n"
            start_text = "Это первое напоминание.\n" if start else ""
            if msg.payload.get("description"):
                content = f"Сообщение:\n{msg.payload['description']}\n"
            else:
                content = ""
            if msg.payload.get("array"):
                content += "Список:\n"
                for item in msg.payload["array"]:
                    for key, val in item.items():
                        indicator = "✅" if val else "❎"
                        content += f"{key}: {indicator}\n"
                content += "\n"
            text = f"{header}Ваше напоминание.\n{priority_text}{content}{start_text}"
            payld = {
                "text": text,
                "user_id": user_id,
            }
            logger.info(text)
            async with redis.get_client() as client:
                await client.publish("telegram_queue", payld)
