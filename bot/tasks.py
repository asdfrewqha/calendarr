from uuid import UUID

from core.broker import broker
from utils.api_dependencies import check_notifications

from bot import bot


@broker.task
async def send_delayed_message(chat_id: int, msg_id: str):
    msg_id = UUID(msg_id)

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
        content += "Список:\n"
        for item in payload["array"]:
            for key, val in item.items():
                indicator = "✅" if val else "❎"
                content += f"{key}: {indicator}\n"
        content += "\n"

    text = f"{header}Ваше напоминание.\n{priority_text}{content}{start_text}"

    await bot.send_message(
        chat_id=chat_id, text=text, parse_mode="HTML", disable_web_page_preview=True
    )
