from pydantic import BaseModel, ConfigDict


class UserProfileResponse(BaseModel):
    id: int
    username: str
    name: str
    notification_bool: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)
