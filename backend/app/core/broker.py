from app.core.settings import settings
from taskiq_redis import (
    ListRedisScheduleSource,
    RedisAsyncResultBackend,
    RedisStreamBroker,
)

broker = RedisStreamBroker(url=settings.redis_settings.redis_url).with_result_backend(
    RedisAsyncResultBackend(settings.redis_settings.redis_url)
)

source = ListRedisScheduleSource(settings.redis_settings.redis_url, "telegram_queue")
