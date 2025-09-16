import asyncio

from models.redis_adapter import redis_adapter
from tasks import scheduler, send_delayed_message, source


async def main():
    await scheduler.startup()
    async for message in redis_adapter.subscribe("telegram_queue"):
        await send_delayed_message.schedule_by_time(
            source, message["send_date"], message["chat_id"], message["msg_id"]
        )


if __name__ == "__main__":
    asyncio.run(main())
