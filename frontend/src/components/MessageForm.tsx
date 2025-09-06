import { useState } from "react";
import type { Message } from "../types/message";
import { MessageType } from "../types/message";
import { useTelegramMainButton } from "../hooks/useTelegramMainButton";

interface Props {
  initial?: Message;
  onSave: (msg: Omit<Message, "id"> | Message) => void;
}

export default function MessageForm({ initial, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<MessageType>(initial?.type ?? MessageType.TEXT);
  const [endDate, setEndDate] = useState(
    initial?.end_send_date ?? new Date().toISOString().slice(0, 16)
  );
  const [priority, setPriority] = useState(initial?.priority ?? 1);
  const [notification, setNotification] = useState(initial?.notification ?? false);

  const handleSubmit = () => {
    onSave({
      ...initial,
      name,
      type,
      priority,
      notification,
      end_send_date: new Date(endDate).toISOString(),
      start_send_date: initial?.start_send_date ?? undefined,
      is_active: initial?.is_active ?? true,
      repeat: initial?.repeat ?? false,
    });
  };

  useTelegramMainButton({
    text: "Сохранить",
    onClick: handleSubmit,
    visible: true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-3 p-4 bg-white rounded shadow"
    >
      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <label className="flex flex-col">
        <span className="text-sm text-gray-700">Тип</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MessageType)}
          className="border p-2 rounded"
        >
          {Object.values(MessageType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-700">Дата окончания</span>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={notification}
          onChange={(e) => setNotification(e.target.checked)}
        />
        Уведомление
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-700">Приоритет</span>
        <input
          type="number"
          value={priority}
          min={1}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="border p-2 rounded"
        />
      </label>

      <button type="submit" className="bg-blue-500 text-white py-2 rounded">
        Сохранить
      </button>
    </form>
  );
}
