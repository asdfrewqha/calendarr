import taskiq_aiogram
from taskiq import TaskiqScheduler
from taskiq_redis import ListQueueBroker, RedisScheduleSource

from bot.core.config import REDIS_URL

broker = ListQueueBroker(REDIS_URL)
source = RedisScheduleSource(REDIS_URL)
scheduler = TaskiqScheduler(broker, [source])

taskiq_aiogram.init(broker, "bot.bot:dp", "bot.bot:bot")
