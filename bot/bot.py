import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand

from bot.core.broker import broker
from bot.core.config import BOT_TOKEN
from bot.core.handlers import router

logger = logging.getLogger(__name__)
dp = Dispatcher()
dp.include_router(router=router)

bot = Bot(BOT_TOKEN)


async def on_startup(bot: Bot, *_args, **_kwargs):
    if not broker.is_worker_process:
        logger.info("Setting up taskiq")
        await broker.startup()
    logger.info("Bot started successfully")


async def on_shutdown(bot: Bot, *_args, **_kwargs):
    logger.info("Shutting down bot...")
    if not broker.is_worker_process:
        logging.info("Shutting down taskiq...")
        await broker.shutdown()
    logger.info("Bot shutdown complete")


async def main():
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Отправить через минуту"),
        ]
    )
    dp.startup.register(lambda: on_startup(bot))
    dp.shutdown.register(lambda: on_shutdown(bot))
    try:
        logger.info("Starting bot polling")
        await dp.start_polling(bot)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped by user")
    finally:
        await on_shutdown(bot)


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    finally:
        loop.close()
