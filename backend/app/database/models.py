from datetime import date, time
from typing import List, Optional

import inflect
from app.database.mixins.id_mixins import IDMixin
from app.database.mixins.timestamp_mixins import TimestampsMixin
from app.database.utils import MsgType
from sqlalchemy import ARRAY, BigInteger, Boolean, Date, Enum, Integer, String, Time
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, declarative_base, declared_attr, mapped_column

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
    start_send_date: Mapped[Optional[date]] = mapped_column(Date(), nullable=False)
    type: Mapped[MsgType] = mapped_column(Enum(MsgType), default=MsgType.ALARM)
    start_send_time: Mapped[time] = mapped_column(Time(timezone=True), nullable=True)
    end_send_date: Mapped[date] = mapped_column(Date(), nullable=True)
    end_send_time: Mapped[time] = mapped_column(Time(timezone=True), nullable=True)
    priority: Mapped[int] = mapped_column(Integer)
    notification: Mapped[bool] = mapped_column(Boolean, default=True)
    repeat: Mapped[bool] = mapped_column(Boolean)
    repeat_wd: Mapped[Optional[List[int]]] = mapped_column(ARRAY(Integer), nullable=True)
