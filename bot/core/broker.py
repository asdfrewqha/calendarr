from core.config import REDIS_URL
from taskiq import TaskiqScheduler
from taskiq_redis import ListQueueBroker, RedisScheduleSource

broker = ListQueueBroker(REDIS_URL)
source = RedisScheduleSource(REDIS_URL)
scheduler = TaskiqScheduler(broker, [source])
