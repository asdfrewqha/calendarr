from core.config import REDIS_URL
from taskiq import TaskiqScheduler
from taskiq_redis import (
    ListRedisScheduleSource,
    RedisAsyncResultBackend,
    RedisStreamBroker,
)

broker = RedisStreamBroker(url=REDIS_URL).with_result_backend(RedisAsyncResultBackend(REDIS_URL))

source = ListRedisScheduleSource(REDIS_URL, "telegram_queue")
scheduler = TaskiqScheduler(broker, [source])
