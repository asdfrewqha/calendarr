from enum import Enum


class MessageType(Enum):
    TEXT = "TEXT"
    NOTIFICATION = "NOTIF"
    EVENT = "EVENT"
    TASK = "TASK"
    ARRAY = "ARRAY"
