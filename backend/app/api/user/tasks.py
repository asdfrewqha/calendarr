import asyncio
import atexit
import json
from functools import wraps
from uuid import UUID

import aio_pika
from app.core.celery_config import app
from app.core.settings import settings

connection_pool = None


async def get_connection():
    global connection_pool
    if connection_pool is None:
        connection_pool = await aio_pika.connect_robust(settings.rbmq.celery_url)
    return connection_pool


async def publish_message(message: dict):
    connection = await get_connection()
    channel = await connection.channel()

    try:
        await channel.declare_queue(
            "telegram_queue",
            durable=True,
            arguments={"x-message-ttl": 3600000, "x-queue-mode": "lazy"},
        )
    except aio_pika.exceptions.ChannelPreconditionFailed:
        pass

    await channel.default_exchange.publish(
        aio_pika.Message(
            body=json.dumps(message).encode(), delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        ),
        routing_key="telegram_queue",
    )

    await channel.close()


def async_to_sync(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(func(*args, **kwargs))

    return wrapper


@app.task(
    acks_late=True,
    time_limit=1740,
    soft_time_limit=1680,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    max_retries=3,
)
def schedule_telegram_message(chat_id: int, msg_id: UUID):
    try:
        async_wrapper = async_to_sync(publish_message)
        async_wrapper({"chat_id": chat_id, "msg_id": str(msg_id)})
    except asyncio.TimeoutError:
        raise schedule_telegram_message.retry(countdown=60, exc=asyncio.TimeoutError)
    except Exception as e:
        raise schedule_telegram_message.retry(countdown=300, exc=e)


@atexit.register
def close_connections():
    if connection_pool:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(connection_pool.close())
