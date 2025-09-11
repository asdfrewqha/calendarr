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
  is_active,
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
    return "Описания нет";
  };

  const renderArrayFull = () => {
    if (!arrayState.length) return null;
    return arrayState.map((item, i) => (
      <div key={i} className="flex flex-wrap gap-2">
        {Object.entries(item).map(([key, val]) => (
          <div
            key={key}
            className={`px-2 py-1 rounded cursor-pointer text-xs font-medium ${
              val ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
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
        is_active
          ? "border-gray-700 bg-gray-800 text-gray-100"
          : "border-gray-500 bg-gray-100 text-gray-700"
      }`}
    >
      {error && (
        <div className="mb-3 rounded bg-gray-200 text-gray-700 px-3 py-2 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Верхняя часть с индикатором активности */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              is_active ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h3 className="font-semibold text-lg">{name}</h3>
        </div>
        <span className="text-sm">
          {new Date(date).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Превью, если не развёрнуто */}
      {!expanded && (
        <div className="px-4 pb-4">
          <p className="whitespace-pre-wrap">{renderPreview()}</p>
        </div>
      )}

      {/* Развёрнутое содержимое */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 max-w-3xl mx-auto flex flex-col gap-4">
          <span className="text-left">{payload?.description ?? "Описания нет"}</span>
          {arrayState.length > 0 && (
            <div className="text-left">
              <span className="font-medium block mb-2">Список задач:</span>
              {renderArrayFull()}
            </div>
          )}
        </div>
      </div>

      {/* Кнопка разворота */}
      <div
        className={`cursor-pointer transition p-4 text-center font-medium select-none ${
          is_active ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Свернуть" : "Развернуть"}
      </div>

      {/* Лейблы типа/приоритета */}
      <div className="flex flex-wrap gap-2 justify-center mt-2 p-2">
        {type && (
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              is_active ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-500"
            }`}
          >
            {MessageTypeLabel[type]}
          </span>
        )}
        {priority !== undefined && (
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              is_active ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-500"
            }`}
          >
            Приоритет {priority}
          </span>
        )}
      </div>

      {/* Кнопки редактировать/удалить */}
      <div className="flex gap-4 justify-center mb-4">
        <Link
          to={`/edit/${id}`}
          className="text-sm font-medium text-blue-400 hover:underline"
        >
          ✏️ Редактировать
        </Link>

        <button
          onClick={handleDelete}
          className="text-sm font-medium text-red-400 hover:underline"
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}
