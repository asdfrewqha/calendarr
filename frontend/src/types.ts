// src/types.ts
export enum MessageType {
  TEXT = "TEXT",
  NOTIFICATION = "NOTIFICATION",
  EVENT = "EVENT",
  TASK = "TASK",
  ARRAY = "ARRAY",
}

export const MessageTypeLabel: Record<MessageType, string> = {
  [MessageType.NOTIFICATION]: "Уведомление",
  [MessageType.EVENT]: "Событие",
  [MessageType.TASK]: "Задача",
  [MessageType.TEXT]: "Напоминание",
  [MessageType.ARRAY]: "Список",
};
