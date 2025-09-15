from datetime import datetime
from uuid import UUID

from app.core.broker import source
from taskiq import ScheduledTask


async def schedule(msg_id: UUID, user_id: int, send_date: datetime):
    scheduled_task_1 = ScheduledTask(
        task_name="send_delayed_message",
        labels={"chat_id": str(user_id), "scheduled_time": send_date.isoformat()},
        args=[user_id, msg_id],
        schedule_id=str(msg_id),
        time=send_date,
    )
    await source.add_schedule(scheduled_task_1)
