from celery import Celery

from app.core.settings import settings

from app.core.logging import get_logger

logger = get_logger()

logger.info(settings.rbmq.celery_url)

app = Celery(main="app", broker=settings.rbmq.celery_url, backend=settings.rbmq.celery_back_url)

app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]

app.autodiscover_tasks(packages=["app.api.user"])
