import asyncio
import logging

from aiogram import Bot
from aiogram.types import BotCommand
from core.broker import broker
from core.config import BOT_TOKEN

bot = Bot(BOT_TOKEN)

logger = logging.getLogger(__name__)


async def main():
    await broker.startup()
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить мини-приложение"),
        ]
    )
    logger.info("Starting bot polling")


if __name__ == "__main__":
    asyncio.run(main())
