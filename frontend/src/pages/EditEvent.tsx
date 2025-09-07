import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent, updateEvent } from "../api/events";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("EVENT");
  const [notification, setNotification] = useState(true);
  const [priority, setPriority] = useState(5);

  useEffect(() => {
    if (!id) return;
    getEvent(id).then((data) => {
      setName(data.name || "");
      setEndDate(
        data.end_send_date
          ? new Date(data.end_send_date).toISOString().slice(0, 16)
          : ""
      );
      setType(data.type);
      setNotification(data.notification);
      setPriority(data.priority);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    await updateEvent(id, {
      name,
      end_send_date: new Date(endDate).toISOString(),
      type,
      notification,
      priority,
    });

    navigate("/");
  };

  if (loading) return <p className="text-center text-gray-500">Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Редактировать событие</h1>

      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded p-2"
      />

      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full border rounded p-2"
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="EVENT">Событие</option>
        <option value="TASK">Задача</option>
        <option value="NOTIFICATION">Уведомление</option>
        <option value="TEXT">Текст</option>
        <option value="ARRAY">Массив</option>
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={notification}
          onChange={(e) => setNotification(e.target.checked)}
        />
        Напоминание
      </label>

      <input
        type="number"
        min={1}
        max={10}
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value))}
        className="w-full border rounded p-2"
      />

      <button
        type="submit"
        className="bg-tg text-white px-4 py-2 rounded-lg w-full"
      >
        Сохранить
      </button>
    </form>
  );
}
