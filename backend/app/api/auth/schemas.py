from typing import NamedTuple, Optional

from pydantic import BaseModel


class UserCreate(BaseModel):
    id: int
    name: Optional[str] = None
    username: Optional[str] = None


class InitData(BaseModel):
    initData: str


class TokensTuple(NamedTuple):
    access_token: str
    refresh_token: str
