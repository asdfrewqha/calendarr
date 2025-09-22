import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand
from core.config import BOT_TOKEN, REDIS_URL
from core.handlers import router
from redis.asyncio import Redis

logger = logging.getLogger(__name__)
dp = Dispatcher()
dp.include_router(router=router)

bot = Bot(BOT_TOKEN)
redis = Redis.from_url(REDIS_URL, decode_responses=True)


async def redis_subscriber():
    pubsub = redis.pubsub()
    logger.info("Waiting for redis messages")
    await pubsub.subscribe("telegram_queue")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        data = message["data"]
        logger.info(f"Received pubsub message: {data}")
        try:
            await bot.send_message(chat_id=data["user_id"], text=data["text"], parse_mode="HTML")
        except Exception as e:
            logger.error(f"Error while sending message: {e}")


async def main():
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Отправить через минуту"),
        ]
    )

    asyncio.create_task(redis_subscriber())

    try:
        logger.info("Starting bot polling")
        await dp.start_polling(bot)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped by user")


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    finally:
        loop.close()
