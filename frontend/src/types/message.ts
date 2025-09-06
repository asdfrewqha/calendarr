export const MessageType = {
  TEXT: "TEXT",
  NOTIFICATION: "NOTIFICATION",
  EVENT: "EVENT",
  TASK: "TASK",
  ARRAY: "ARRAY",
}

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface Message {
  id?: string;
  user_id?: number;
  name?: string;
  payload?: Record<string, any>;
  start_send_date?: string; // ISO строка
  end_send_date: string; // обязательное
  type: MessageType;
  is_active?: boolean;
  notification: boolean; // default true
  priority: number; // default 5
  repeat: boolean; // default false
  repeat_date?: string;
  repeat_wd?: number[];
}

// вспомогательный объект для создания нового сообщения с дефолтами
export const defaultMessage: Omit<Message, "id"> = {
  end_send_date: new Date().toISOString(),
  type: MessageType.EVENT,
  notification: true,
  priority: 5,
  repeat: false,
};
