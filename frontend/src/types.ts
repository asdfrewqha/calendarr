// src/types.ts
export enum MessageType {
  TEXT = "TEXT",
  NOTIFICATION = "NOTIFICATION",
  EVENT = "EVENT",
  TASK = "TASK",
  ARRAY = "ARRAY",
  ALARM = "ALARM"
}

export const MessageTypeLabel: Record<MessageType, string> = {
  [MessageType.NOTIFICATION]: "Уведомление",
  [MessageType.EVENT]: "Событие",
  [MessageType.TASK]: "Задача",
  [MessageType.TEXT]: "Заметка",
  [MessageType.ARRAY]: "Список",
  [MessageType.ALARM]: "Напоминание",
};
