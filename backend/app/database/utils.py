from enum import Enum


class MsgType(Enum):
    ALARM = "ALARM"
    EVENT_SHORT = "EVENT_SHORT"
    EVENT_LONG = "EVENT_LONG"
    ARRAY = "ARRAY"
    TASK = "TASK"
