import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand

from bot.core.config import BOT_TOKEN
from bot.core.handlers import router
from bot.models.redis_adapter import redis_adapter

logger = logging.getLogger(__name__)
dp = Dispatcher()
dp.include_router(router=router)

bot = Bot(BOT_TOKEN)


async def main():
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Отправить через минуту"),
        ]
    )
    try:
        logger.info("Starting bot polling")
        await dp.start_polling(bot)
        async for x in redis_adapter.subscribe("telegram_queue"):
            await bot.send_message(x.get("user_id"), x.get("text"))
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
