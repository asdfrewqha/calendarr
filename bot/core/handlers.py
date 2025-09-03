import logging

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiohttp import ClientSession
from core.config import BACKEND_URL
from core.keyboards import inline_miniapp_kbd

router = Router()

logger = logging.getLogger(__name__)


@router.message(Command("start"))
async def handle_start(message: Message):
    async with ClientSession() as session:
        await session.post(
            url=f"{BACKEND_URL}/register",
            params={
                "id": message.chat.id,
                "name": message.chat.first_name,
                "username": message.chat.username
            },
        )
    await message.answer("Открыть МиниПриложение:", reply_markup=inline_miniapp_kbd)
