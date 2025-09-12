// src/components/EventForm.tsx
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MessageType, MessageTypeLabel } from "../types";
import { getCurrentTime } from "../utils/dateUtils";

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export type RepeatMode = "none" | "once" | "weekly";

export interface EventFormData {
  name: string;
  payload?: {
    description?: string;
    array?: { [key: string]: boolean }[];
  };
  type: MessageType;
  priority: number;
  notification: boolean;
  repeatMode: RepeatMode;
  hasStart: boolean;
  startDate?: Date;
  startTime?: string;
  endDate: Date;
  endTime: string;
  repeatDate?: Date;
  repeatTime?: string;
  daysOfWeek?: number[];
}

export default function EventForm({
  initialData,
  onSubmit,
  submitLabel,
}: {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<MessageType>(
    initialData?.type ?? MessageType.TEXT
  );
  const [priority, setPriority] = useState(initialData?.priority ?? 5);
  const [notification, setNotification] = useState(
    initialData?.notification ?? true
  );
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(
    initialData?.repeatMode ?? "none"
  );

  const [hasStart, setHasStart] = useState(initialData?.hasStart ?? false);

  const [startDate, setStartDate] = useState(
    initialData?.startDate ?? new Date()
  );
  const [startTime, setStartTime] = useState(
    initialData?.startTime ?? getCurrentTime()
  );

  const [endDate, setEndDate] = useState(
    initialData?.endDate ?? new Date()
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime ?? getCurrentTime()
  );

  const [repeatDate, setRepeatDate] = useState(
    initialData?.repeatDate ?? new Date()
  );
  const [repeatTime, setRepeatTime] = useState(
    initialData?.repeatTime ?? getCurrentTime()
  );

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialData?.daysOfWeek ?? []
  );

  // --- payload ---
  const [description, setDescription] = useState(
    initialData?.payload?.description ?? ""
  );
  const [tasks, setTasks] = useState<{ text: string; completed: boolean }[]>(
    initialData?.payload?.array?.map((obj) => {
      const [text, completed] = Object.entries(obj)[0];
      return { text, completed };
    }) ?? []
  );

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addTask = () => setTasks([...tasks, { text: "", completed: false }]);
  const updateTaskText = (index: number, text: string) => {
    const copy = [...tasks];
    copy[index].text = text;
    setTasks(copy);
  };
  const toggleTaskCompleted = (index: number) => {
    const copy = [...tasks];
    copy[index].completed = !copy[index].completed;
    setTasks(copy);
  };
  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // валидация: дата начала <= дата конца
  const handleStartDateChange = (date: Date) => {
    if (date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  // валидация: дата конца >= даты начала
  const handleEndDateChange = (date: Date) => {
    if (date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  };

  // валидация: дата повторения >= даты окончания
  const handleRepeatDateChange = (date: Date) => {
    if (date < endDate) {
      setEndDate(date);
    }
    setRepeatDate(date);
  };

  const handleSubmit = () => {
    const payload: EventFormData["payload"] =
      type === MessageType.ARRAY
        ? { array: tasks.map((t) => ({ [t.text]: t.completed })) }
        : description
        ? { description }
        : undefined;

    onSubmit({
      name,
      type,
      priority,
      notification,
      repeatMode,
      hasStart,
      startDate,
      startTime,
      endDate,
      endTime,
      repeatDate,
      repeatTime,
      daysOfWeek,
      payload,
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-gray-800 rounded-xl text-white">
      {/* Тип события */}
      <div>
        <label className="block mb-1">Тип события</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MessageType)}
          className="w-full p-2 rounded bg-gray-700"
        >
          {Object.entries(MessageTypeLabel).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Название */}
      <input
        type="text"
        placeholder="Название"
        className="w-full p-2 rounded bg-gray-700"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Описание */}
      <textarea
        placeholder="Описание"
        className="w-full p-2 rounded bg-gray-700"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Список задач */}
      {type === MessageType.ARRAY && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <h4 className="font-medium">Список задач</h4>
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-1 rounded bg-gray-700"
                value={task.text}
                onChange={(e) => updateTaskText(i, e.target.value)}
                placeholder={`Задача ${i + 1}`}
              />
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompleted(i)}
              />
              <button
                type="button"
                className="text-red-500"
                onClick={() => removeTask(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 p-1 bg-blue-600 rounded"
            onClick={addTask}
          >
            + Добавить задачу
          </button>
        </div>
      )}

      {/* Повторение */}
      <div className="space-y-1">
        <label className="block font-medium">Повторение</label>
        <select
          value={repeatMode}
          onChange={(e) => setRepeatMode(e.target.value as RepeatMode)}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="none">Нет повторения</option>
          <option value="once">Однократное повторение</option>
          <option value="weekly">Повторение по неделям</option>
        </select>
      </div>

      {/* Дата начала */}
      {hasStart && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <label className="block font-medium">Дата начала</label>
          <Calendar onChange={(v) => handleStartDateChange(v as Date)} value={startDate} />
          <input
            type="time"
            className="p-1 rounded mt-1 bg-gray-700"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasStart}
          onChange={(e) => setHasStart(e.target.checked)}
        />
        Включить дату начала
      </label>

      {/* Дата окончания */}
      <div className="bg-gray-900 p-2 rounded space-y-2">
        <label className="block font-medium">Дата окончания</label>
        <Calendar onChange={(v) => handleEndDateChange(v as Date)} value={endDate} />
        <input
          type="time"
          className="p-1 rounded mt-1 bg-gray-700"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {/* Однократное повторение */}
      {repeatMode === "once" && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <label className="block font-medium">Дата повторения</label>
          <Calendar onChange={(v) => handleRepeatDateChange(v as Date)} value={repeatDate} />
          <input
            type="time"
            className="p-1 rounded mt-1 bg-gray-700"
            value={repeatTime}
            onChange={(e) => setRepeatTime(e.target.value)}
          />
        </div>
      )}

      {/* Повторение по неделям */}
      {repeatMode === "weekly" && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <span>Выберите дни недели</span>
          <div className="flex gap-1 flex-wrap">
            {weekDays.map((d, i) => (
              <button
                key={i}
                type="button"
                className={`px-2 py-1 rounded ${
                  daysOfWeek.includes(i) ? "bg-blue-500 text-white" : "bg-gray-700"
                }`}
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Уведомление */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={notification}
          onChange={(e) => setNotification(e.target.checked)}
        />
        <span>Уведомление</span>
      </div>

      {/* Приоритет */}
      <div>
        <label>Приоритет</label>
        <input
          type="number"
          value={priority === 0 ? "" : priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full p-1 rounded bg-gray-700"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full p-2 bg-blue-600 rounded mt-2"
      >
        {submitLabel}
      </button>
    </div>
  );
}
