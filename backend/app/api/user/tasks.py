import asyncio
import atexit
import json
import logging
from functools import wraps
from uuid import UUID

import aio_pika
from app.core.celery_config import app
from app.core.settings import settings

logger = logging.getLogger(__name__)

connection_pool = None
connection_lock = asyncio.Lock()


async def get_connection():
    global connection_pool

    async with connection_lock:
        if connection_pool is None or connection_pool.is_closed:
            try:
                connection_pool = await aio_pika.connect_robust(
                    settings.rbmq.celery_url, timeout=30, reconnect_interval=5
                )
                logger.info("Created new RabbitMQ connection")
            except Exception as e:
                logger.error(f"Failed to create RabbitMQ connection: {e}")
                raise
        return connection_pool


async def publish_message(message: dict):
    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            connection = await get_connection()
            async with connection.channel() as channel:
                await channel.declare_queue(
                    "telegram_queue",
                    durable=True,
                    arguments={"x-message-ttl": 3600000, "x-queue-mode": "lazy"},
                )

                await channel.default_exchange.publish(
                    aio_pika.Message(
                        body=json.dumps(message).encode(),
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                    ),
                    routing_key="telegram_queue",
                )
                logger.info("Message published successfully")
                return

        except aio_pika.exceptions.ChannelPreconditionFailed:
            logger.warning("Queue declaration failed, attempting without parameters")
            try:
                connection = await get_connection()
                async with connection.channel() as channel:
                    await channel.default_exchange.publish(
                        aio_pika.Message(
                            body=json.dumps(message).encode(),
                            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                        ),
                        routing_key="telegram_queue",
                    )
                    logger.info("Message published with existing queue")
                    return
            except Exception as e:
                logger.error(f"Failed to publish with existing queue: {e}")
                if attempt == max_retries - 1:
                    raise

        except (aio_pika.exceptions.AMQPConnectionError, ConnectionResetError, RuntimeError) as e:
            logger.warning(f"Connection error (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(retry_delay * (attempt + 1))

        except Exception as e:
            logger.error(f"Unexpected error (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(retry_delay)


def async_to_sync(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        if loop.is_running():
            # If loop is already running, create a new one for this operation
            temp_loop = asyncio.new_event_loop()
            try:
                return temp_loop.run_until_complete(func(*args, **kwargs))
            finally:
                temp_loop.close()
        else:
            return loop.run_until_complete(func(*args, **kwargs))

    return wrapper


@app.task(
    acks_late=True,
    time_limit=60,
    soft_time_limit=45,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    max_retries=5,
    bind=True,
)
def schedule_telegram_message(self, chat_id: int, msg_id: UUID):
    try:
        async_wrapper = async_to_sync(publish_message)
        async_wrapper({"chat_id": chat_id, "msg_id": str(msg_id)})
    except asyncio.TimeoutError:
        logger.warning("Timeout publishing message, retrying")
        raise self.retry(countdown=60, exc=asyncio.TimeoutError)
    except Exception as e:
        logger.error(f"Error publishing message: {e}")
        raise self.retry(countdown=min(300, 60 * (self.request.retries + 1)), exc=e)


@atexit.register
def close_connections():
    global connection_pool
    if connection_pool and not connection_pool.is_closed:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(connection_pool.close())
        else:
            loop.run_until_complete(connection_pool.close())
