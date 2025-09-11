from app.core.logging import get_logger
from app.core.settings import settings
from celery import Celery

logger = get_logger()

logger.info(settings.rbmq.celery_url)

app = Celery(main="app", broker=settings.rbmq.celery_url, backend=settings.redis_settings.redis_url)

app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]

app.conf.task_acks_late = True
app.conf.worker_prefetch_multiplier = 1
app.conf.broker_heartbeat = 60

app.autodiscover_tasks(packages=["app.api.user"])
