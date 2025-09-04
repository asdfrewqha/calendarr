import asyncio
import json
from uuid import UUID

import aio_pika
from app.core.celery_config import app
from app.core.settings import settings


async def publish_message(message: dict):
    connection = await aio_pika.connect_robust(settings.rbmq.celery_url)
    channel = await connection.channel()
    await channel.default_exchange.publish(
        aio_pika.Message(body=json.dumps(message).encode()), routing_key="telegram_queue"
    )
    await connection.close()


@app.task
def schedule_telegram_message(chat_id: int, msg_id: UUID):
    asyncio.run(publish_message({"chat_id": chat_id, "msg_id": str(msg_id)}))


@app.task
def send_msg(chat_id: int, text: str):
    asyncio.run(publish_message({"chat_id": chat_id, "text": text}))
