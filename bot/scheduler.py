import asyncio

from core.broker import scheduler, source
from models.redis_adapter import redis_adapter
from tasks import send_delayed_message


async def main():
    await scheduler.startup()
    async for message in redis_adapter.subscribe("telegram_queue"):
        await send_delayed_message.schedule_by_time(
            source, message["send_date"], message["user_id"], message["msg_id"]
        )


if __name__ == "__main__":
    asyncio.run(main())
