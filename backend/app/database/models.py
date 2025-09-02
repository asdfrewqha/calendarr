import inflect
from datetime import datetime

from sqlalchemy import String, Text, BigInteger, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, declared_attr

from app.database.mixins.id_mixins import IDMixin
from app.database.mixins.timestamp_mixins import TimestampsMixin

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
    text: Mapped[str] = mapped_column(Text)
    send_at: Mapped[datetime] = mapped_column(DateTime)
