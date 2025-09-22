from app.core.logging.logging import get_logger
from app.core.settings import settings
from app.database.models import Base
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

logger = get_logger()


class DBDependency:
    def __init__(self) -> None:
        self._engine = create_async_engine(
            url=settings.db_settings.db_url, echo=settings.db_settings.db_echo
        )
        self._session_factory = async_sessionmaker(
            bind=self._engine, expire_on_commit=False, autocommit=False
        )

    @property
    def db_session(self) -> async_sessionmaker[AsyncSession]:
        return self._session_factory

    @staticmethod
    async def initialize_tables(self) -> None:
        logger.info(settings.db_settings.db_url)
        logger.info("Tables are created or exists")
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
