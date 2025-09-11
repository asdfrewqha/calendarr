from datetime import datetime
from typing import Optional
from uuid import UUID

from app.database.utils import MessageType
from pydantic import BaseModel, ConfigDict


class UserProfileResponse(BaseModel):
    id: int
    username: str
    name: str
    notifications_bool: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class MessageCreateScheme(BaseModel):
    id: Optional[UUID] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: Optional[datetime] = None
    send_start: bool = False
    end_send_date: datetime
    type: MessageType
    notification: bool = True
    priority: int = 5
    repeat: bool = False
    repeat_date: Optional[datetime] = None
    repeat_wd: Optional[list] = None
    event: str = None


class CreatedMessageResponse(BaseModel):
    id: UUID


class MessageScheme(BaseModel):
    id: Optional[UUID] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: Optional[datetime] = None
    end_send_date: datetime
    is_active: bool = True
    type: MessageType
    notification: bool
    priority: int
    repeat: bool = False
    repeat_date: Optional[datetime] = None
    repeat_wd: Optional[list] = None


class MessageUpdateScheme(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: Optional[datetime] = None
    end_send_date: Optional[datetime] = None
    type: Optional[MessageType] = None
    notification: Optional[bool] = None
    priority: Optional[int] = None
    repeat: bool = False
    repeat_date: Optional[datetime] = None
    repeat_wd: Optional[list] = None
    event: str = None
