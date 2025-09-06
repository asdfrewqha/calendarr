import type { Message } from "../types/message";

interface Props {
  message: Message;
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
}

export default function MessageCard({ message, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white p-3 rounded shadow flex justify-between items-center">
      <div>
        <h3 className="font-bold">{message.name ?? "Без названия"}</h3>
        <p className="text-sm text-gray-600">
          {new Date(message.end_send_date).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          Тип: {message.type} | Приоритет: {message.priority}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(message)}
          className="text-blue-500 hover:underline"
        >
          ✏️
        </button>
        {message.id && (
          <button
            onClick={() => onDelete(message.id!)}
            className="text-red-500 hover:underline"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
