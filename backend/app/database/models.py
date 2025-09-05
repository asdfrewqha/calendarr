import inflect
from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, BigInteger, DateTime, Boolean, Enum, Integer, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, declared_attr
from sqlalchemy.dialects.postgresql import JSONB

from app.database.mixins.id_mixins import IDMixin
from app.database.mixins.timestamp_mixins import TimestampsMixin
from app.database.utils import MessageType

p = inflect.engine()


class Base:
    @declared_attr
    def __tablename__(cls):
        return p.plural(cls.__name__.lower())


Base = declarative_base(cls=Base)


class User(TimestampsMixin, Base):
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    notifications_bool: Mapped[bool] = mapped_column(Boolean, default=True)


class Message(IDMixin, TimestampsMixin, Base):
    user_id: Mapped[int] = mapped_column(BigInteger)
    name: Mapped[str] = mapped_column(String, nullable=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=True)
    start_send_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_send_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    type: Mapped[MessageType] = mapped_column(Enum(MessageType), default=MessageType.TEXT)
    notification: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer)
    repeat: Mapped[bool] = mapped_column(Boolean)
    repeat_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    repeat_wd: Mapped[Optional[List[int]]] = mapped_column(ARRAY(Integer), nullable=True)
