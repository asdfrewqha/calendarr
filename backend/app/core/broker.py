from app.core.settings import settings
from taskiq import TaskiqScheduler
from taskiq_redis import ListRedisScheduleSource, RedisStreamBroker

broker = RedisStreamBroker(settings.redis_settings.redis_url)
source = ListRedisScheduleSource(settings.redis_settings.redis_url)

scheduler = TaskiqScheduler(broker, [source])
