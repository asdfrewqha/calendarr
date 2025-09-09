import asyncio
import json
import logging
from uuid import UUID

import aio_pika
from aiogram.types import BotCommand
from core.config import RABBITMQ_URL
from core.dp import bot, dp, send_md_message
from utils.api_dependencies import check_notifications

logger = logging.getLogger(__name__)


async def on_message(message: aio_pika.IncomingMessage):
    async with message.process():
        data = json.loads(message.body)
        chat_id = data["chat_id"]
        msg_id = data.get("msg_id")

        payload = await check_notifications(chat_id=chat_id, msg_id=UUID(msg_id))

        start = payload.get("start_notification", False)
        priority = payload.get("priority", "Unknown")
        name = payload.get("name")

        header = f"<b>{name}</b>\n" if name else ""
        priority_text = f"Приоритет: {priority}\n"
        start_text = "Это первое напоминание.\n" if start else ""

        if payload.get("description"):
            content = f"Сообщение:\n{payload['description']}\n"
        else:
            content = ""
        if payload.get("array"):
            content = "Список:\n"
            for item in payload["array"]:
                for key, val in item.items():
                    indicator = "✅" if val else "❎"
                    content += f"{key}: {indicator}\n"
            content += "\n"

        text = f"{header}Ваше напоминание.\n{priority_text}{content}{start_text}"

        await send_md_message(chat_id=chat_id, text=text)


async def connect_with_retry(url, retries=10, delay=5):
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Connecting to RabbitMQ (attempt {attempt})...")
            return await aio_pika.connect_robust(url)
        except Exception as e:
            logger.warning(f"Attempt {attempt} failed: {e}")
            await asyncio.sleep(delay)
    raise RuntimeError("Could not connect to RabbitMQ after retries")


async def start_rabbitmq_listener():
    connection = await connect_with_retry(RABBITMQ_URL)
    channel = await connection.channel()
    queue = await channel.declare_queue("telegram_queue", durable=True)
    await queue.consume(on_message)
    logger.info("[*] Waiting for messages")


async def start_bot():
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить мини-приложение"),
        ]
    )
    logger.info("Starting bot polling")
    await dp.start_polling(bot)


async def main():
    asyncio.create_task(start_rabbitmq_listener())
    await start_bot()


if __name__ == "__main__":
    asyncio.run(main())
