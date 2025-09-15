from core.config import REDIS_URL
from taskiq_redis import RedisAsyncResultBackend, RedisStreamBroker

broker = RedisStreamBroker(url=REDIS_URL).with_result_backend(RedisAsyncResultBackend(REDIS_URL))
