from aio_celery import Celery
from app.core.logging import get_logger
from app.core.settings import settings

logger = get_logger()
logger.info("Initializing Celery")

app = Celery()

app.conf.update(
    broker_url=settings.rbmq.celery_url,
    result_backend=settings.redis_settings.redis_url,
)

app.autodiscover_tasks(packages=["app.api.user"])
logger.info("Celery configuration loaded successfully")
