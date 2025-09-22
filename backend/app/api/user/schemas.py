from datetime import date, time
from typing import Optional
from uuid import UUID

from app.database.utils import MsgType
from pydantic import BaseModel, ConfigDict


class UserProfileResponse(BaseModel):
    id: int
    username: str
    name: str
    notifications_bool: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class MessageCreateScheme(BaseModel):
    event: str = None
    id: Optional[UUID] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: date
    type: MsgType
    start_send_time: Optional[time] = None
    end_send_date: Optional[date] = None
    end_send_time: Optional[time] = None
    send_start: bool = True
    send_end: Optional[bool] = None
    start_schedule_id: Optional[UUID] = None
    end_schedule_id: Optional[UUID] = None
    priority: int
    notification: bool = True
    repeat: Optional[bool] = None
    repeat_wd: Optional[list] = None


class CreatedMessageResponse(BaseModel):
    id: UUID


class MessageScheme(BaseModel):
    id: Optional[UUID] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: date
    type: MsgType
    start_send_time: Optional[time] = None
    end_send_date: Optional[date] = None
    end_send_time: Optional[time] = None
    priority: int
    notification: bool = True
    repeat: bool = False
    repeat_wd: Optional[list] = None

    model_config = {"from_attributes": True}


class MessageUpdateScheme(BaseModel):
    event: str = None
    id: Optional[UUID] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    payload: Optional[dict] = None
    start_send_date: Optional[date] = None
    type: Optional[MsgType] = None
    start_send_time: Optional[time] = None
    end_send_date: Optional[date] = None
    end_send_time: Optional[time] = None
    send_start: bool = True
    send_end: Optional[bool] = None
    start_schedule_id: Optional[UUID] = None
    end_schedule_id: Optional[UUID] = None
    priority: Optional[int] = None
    notification: bool = True
    repeat: bool = False
    repeat_wd: Optional[list] = None
