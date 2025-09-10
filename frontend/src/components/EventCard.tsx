import { Link } from "react-router-dom";
import { delEvent } from "../api/events";

type Props = {
  id: string;
  title: string;
  date: string;
  description?: string;
  type?: string;
  priority?: number;
  is_active?: boolean; // новый параметр
  onDeleted?: (id: string) => void; // callback после удаления
};

export default function EventCard({
  id,
  title,
  date,
  description,
  type,
  priority,
  is_active = true,
  onDeleted,
}: Props) {
  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить это событие?")) return;
    try {
      await delEvent(id);
      onDeleted?.(id); // уведомляем родителя
    } catch (err) {
      console.error("Ошибка при удалении события:", err);
      alert("Не удалось удалить событие");
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${
        is_active ? "border-gray-200 bg-white" : "border-gray-300 bg-gray-100"
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-semibold text-lg ${!is_active ? "text-gray-400" : ""}`}>
          {title}
        </h3>
        <span className={`text-sm ${is_active ? "text-gray-500" : "text-gray-400"}`}>
          {new Date(date).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {description && (
        <p className={`mt-2 ${is_active ? "text-gray-600" : "text-gray-400"}`}>{description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {type && (
          <span className={`px-2 py-1 rounded ${is_active ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-400"}`}>
            {type}
          </span>
        )}
        {priority !== undefined && (
          <span className={`px-2 py-1 rounded ${is_active ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-400"}`}>
            Приоритет {priority}
          </span>
        )}
        {!is_active && (
          <span className="px-2 py-1 bg-red-100 text-red-500 rounded text-xs font-medium">
            Неактивно
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-4">
        <Link
          to={`/edit/${id}`}
          className={`text-sm font-medium ${is_active ? "text-tg hover:underline" : "text-gray-400 cursor-not-allowed"}`}
        >
          ✏️ Редактировать
        </Link>

        <button
          onClick={handleDelete}
          className={`text-sm font-medium ${is_active ? "text-red-500 hover:underline" : "text-gray-400 cursor-not-allowed"}`}
          disabled={!is_active}
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}
