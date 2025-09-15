import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand
from core.broker import broker
from core.config import BOT_TOKEN
from core.handlers import router

logger = logging.getLogger(__name__)
dp = Dispatcher()
dp.include_router(router=router)


async def on_startup(bot: Bot):
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить мини-приложение"),
        ]
    )
    await broker.startup()
    logger.info("Bot started successfully")


async def on_shutdown(bot: Bot):
    logger.info("Shutting down bot...")
    await broker.shutdown()
    await bot.session.close()
    logger.info("Bot shutdown complete")


async def main():
    bot = Bot(BOT_TOKEN)
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
