from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from core.config import BOT_TOKEN
from core.handlers import router
import re

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
dp.include_router(router)


def escape_markdown(text: str) -> str:
    escape_chars = r'[_*\[\]()~`>#+\-=|{}.!]'
    return re.sub(f'({escape_chars})', r'\\\1', text)


async def send_message(chat_id: int, text: str):
    await bot.send_message(chat_id=chat_id, text=text)


async def send_md_message(chat_id: int, text: str):
    escaped_text = escape_markdown(text)
    await bot.send_message(chat_id=chat_id, text=escaped_text, parse_mode="MarkdownV2", disable_web_page_preview=True)
