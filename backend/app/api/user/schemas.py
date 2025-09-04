from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional
from app.database.utils import MessageType
from uuid import UUID


class UserProfileResponse(BaseModel):
    id: int
    username: str
    name: str
    notification_bool: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class MessageCreateScheme(BaseModel):
    user_id: Optional[int] = None
    name: Optional[str] = None
    text: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: datetime
    type: MessageType
    notification: bool = True
    priority: int = 5


class CreatedMessageResponse(BaseModel):
    id: UUID


class ListRequestScheme(BaseModel):
    start_date: date
    end_date: Optional[date] = None


class MessageScheme(BaseModel):
    user_id: Optional[int] = None
    name: Optional[str] = None
    text: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: datetime
    type: MessageType
    notification: bool
    priority: int


class MessageUpdateScheme(BaseModel):
    name: Optional[str] = None
    text: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    type: Optional[MessageType] = None
    notification: Optional[bool] = None
    priority: Optional[int] = None
