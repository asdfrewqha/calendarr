from typing import Annotated
from uuid import UUID

from app.core.broker import broker
from app.database.adapter import adapter
from app.database.models import Message
from app.database.session import get_async_session
from app.utils.redis_adapter import redis_adapter
from sqlalchemy.ext.asyncio import AsyncSession
from taskiq import TaskiqDepends


@broker.task
async def send_telegram(
    msg_id: UUID, user_id: int, session: Annotated[AsyncSession, TaskiqDepends(get_async_session)]
):
    msg = await adapter.get_by_id(Message, msg_id, session)
    if msg.send_start:
        start = True
        await adapter.update_by_id(Message, msg_id, {"send_start": False}, session)
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
    await redis_adapter.publish("telegram_queue", payld)
