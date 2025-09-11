from aio_celery import Celery
from app.core.logging import get_logger
from app.core.settings import settings

logger = get_logger()
logger.info(f"Initializing Celery with broker: {settings.rbmq.celery_url}")

app = Celery(broker=settings.rbmq.celery_url, result_backend=settings.redis_settings.redis_url)

app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    broker_heartbeat=60,
    task_reject_on_worker_lost=True,
)

app.autodiscover_tasks(packages=["app.api.user"])
logger.info("Celery configuration loaded successfully")
