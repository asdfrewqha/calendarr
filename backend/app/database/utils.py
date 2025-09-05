from enum import Enum


class MessageType(Enum):
    TEXT = "TEXT"
    NOTIF = "NOTIFICATION"
    EVENT = "EVENT"
    TASK = "TASK"
    ARRAY = "ARRAY"
