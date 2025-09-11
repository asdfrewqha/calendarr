import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { delEvent, updateEvent } from "../api/events";
import { MessageType, MessageTypeLabel } from "../types";

type ArrayItem = { [key: string]: boolean };

type Props = {
  id: string;
  name: string;
  date: string;
  payload?: { description?: string; array?: ArrayItem[] };
  type?: MessageType;
  priority?: number;
  is_active?: boolean;
  onDeleted?: (id: string) => void;
};

export default function EventCard({
  id,
  name,
  date,
  payload,
  type,
  priority,
  is_active = true,
  onDeleted,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [arrayState, setArrayState] = useState<ArrayItem[]>(
    payload?.array ? JSON.parse(JSON.stringify(payload.array)) : []
  );

  useEffect(() => {
    if (payload?.array) setArrayState(JSON.parse(JSON.stringify(payload.array)));
  }, [payload?.array]);

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить это событие?")) return;
    try {
      await delEvent(id);
      onDeleted?.(id);
    } catch (err) {
      console.error("Ошибка при удалении события:", err);
      setError("Не удалось удалить событие");
    }
  };

  const toggleTask = async (itemIndex: number, key: string) => {
    try {
      const newArray = [...arrayState];
      newArray[itemIndex][key] = !newArray[itemIndex][key];
      setArrayState(newArray);
      await updateEvent(id, { payload: { ...payload, array: newArray } });
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
      setError("Не удалось обновить задачу");
    }
  };

  const renderPreview = () => {
    if (arrayState.length) {
      return arrayState
        .slice(0, 2)
        .map((item) =>
          Object.entries(item)
            .map(([k, v]) => `${k}: ${v ? "✅" : "❎"}`)
            .join(", ")
        )
        .join("; ");
    }
    if (payload?.description) {
      const lines = payload.description.split("\n").slice(0, 2);
      return lines.join("\n");
    }
    return "нет";
  };

  const renderArrayFull = () => {
    if (!arrayState.length) return null;
    return arrayState.map((item, i) => (
      <div key={i} className="flex flex-wrap gap-2">
        {Object.entries(item).map(([key, val]) => (
          <div
            key={key}
            className={`px-2 py-1 rounded cursor-pointer text-xs font-medium ${
              val ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => toggleTask(i, key)}
          >
            {key}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div
      className={`rounded-xl border shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
        is_active ? "border-gray-700 bg-gray-800" : "border-gray-700 bg-gray-900 opacity-70"
      }`}
    >
      {error && (
        <div className="mb-3 rounded bg-gray-900 text-gray-100 px-3 py-2 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Верхняя часть */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-100">{name}</h3>
          <span className="text-sm text-gray-400">
            {new Date(date).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Превью скрывается при развороте */}
        {!expanded && (
          <p className="mt-2 text-gray-300 whitespace-pre-wrap">{renderPreview()}</p>
        )}
      </div>

      {/* Кнопка разворота */}
      <div
        className="cursor-pointer bg-gray-700 hover:bg-gray-600 transition p-4 text-center text-gray-200 font-medium select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Свернуть" : "Развернуть"}
      </div>

      {/* Развёрнутое содержимое с анимацией */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 max-w-3xl mx-auto flex flex-col gap-4 text-gray-200">
          {/* Описание */}
          <span className="text-left">{payload?.description ?? "Описания нет"}</span>

          {/* Список задач */}
          {arrayState.length > 0 && (
            <div className="text-left">
              <span className="font-medium block mb-2">Список задач:</span>
              {renderArrayFull()}
            </div>
          )}
        </div>
      </div>

      {/* Кнопки и метки */}
      <div className="mt-3 flex flex-col items-center gap-3 p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {type && (
            <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-sm">
              {MessageTypeLabel[type]}
            </span>
          )}
          {priority !== undefined && (
            <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-sm">
              Приоритет {priority}
            </span>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to={`/edit/${id}`}
            className={`text-sm font-medium ${
              is_active ? "text-blue-400 hover:underline" : "text-gray-500 cursor-not-allowed"
            }`}
          >
            ✏️ Редактировать
          </Link>

          <button
            onClick={handleDelete}
            className={`text-sm font-medium ${
              is_active ? "text-red-400 hover:underline" : "text-gray-500 cursor-not-allowed"
            }`}
            disabled={!is_active}
          >
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
