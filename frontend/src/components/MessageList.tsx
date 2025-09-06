import type { Message } from "../types/message";
import MessageCard from "./MessageCard";

interface Props {
  messages: Message[];
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
}

export default function MessageList({ messages, onEdit, onDelete }: Props) {
  if (messages.length === 0) {
    return <p className="text-gray-500 text-center">Нет мероприятий</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <MessageCard
          key={m.id ?? Math.random().toString()}
          message={m}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
