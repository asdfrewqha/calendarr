import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MessageType, MessageTypeLabel } from "../types";
import { createEvent } from "../api/events";
import { useNavigate } from "react-router-dom";

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MessageType>(MessageType.TEXT);
  const [priority, setPriority] = useState(5);
  const [notification, setNotification] = useState(true);

  const [repeatMode, setRepeatMode] = useState<"none" | "once" | "weekly">("none");

  const getCurrentTime = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const [hasStart, setHasStart] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(getCurrentTime());

  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(getCurrentTime());

  const [repeatDate, setRepeatDate] = useState(new Date());
  const [repeatTime, setRepeatTime] = useState(getCurrentTime());

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  const navigate = useNavigate();

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };



  const formatDateTime = (date: Date, time?: string) => {
    const dt = new Date(date);
    if (time) {
      const [h, m] = time.split(":").map(Number);
      dt.setHours(h, m, 0, 0);
    } else {
      dt.setHours(0, 0, 0, 0);
    }
    return dt.toISOString();
  };

  const handleSubmit = () => {
    const eventData: any = {
      name: title,
      payload: description ? { description } : undefined,
      type, // отправляем код enum на сервер
      priority,
      notification,
      repeat: repeatMode !== "none",
    };

    if (repeatMode === "none") {
      if (hasStart) eventData.start_send_date = formatDateTime(startDate, startTime);
      eventData.end_send_date = formatDateTime(endDate, endTime);
      eventData.repeat_date = undefined;
      eventData.repeat_wd = undefined;
    } else if (repeatMode === "once") {
      if (hasStart) eventData.start_send_date = formatDateTime(startDate, startTime);
      eventData.end_send_date = formatDateTime(endDate, endTime);
      eventData.repeat_date = formatDateTime(repeatDate, repeatTime);
      eventData.repeat_wd = undefined;
    } else if (repeatMode === "weekly") {
      if (hasStart) eventData.start_send_date = formatDateTime(startDate, startTime);
      eventData.end_send_date = formatDateTime(endDate, endTime);
      eventData.repeat_date = undefined;
      eventData.repeat_wd = daysOfWeek;
    }

    console.log("Создаем событие:", eventData);

    createEvent(eventData);
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-gray-800 rounded-xl text-white">
      <h2 className="text-xl font-bold">Создать событие</h2>

      {/* Тип события */}
      <div>
        <label className="block mb-1">Тип события</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MessageType)}
          className="w-full p-2 rounded bg-gray-700"
        >
          {Object.entries(MessageTypeLabel).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Название и описание */}
      <input
        type="text"
        placeholder="Название"
        className="w-full p-2 rounded bg-gray-700"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Описание"
        className="w-full p-2 rounded bg-gray-700"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Выбор режима повторения */}
      <div className="space-y-1">
        <label className="block font-medium">Повторение</label>
        <select
          value={repeatMode}
          onChange={(e) => setRepeatMode(e.target.value as any)}
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
          <Calendar onChange={(v) => setStartDate(v as Date)} value={startDate} />
          <input type="time" className="p-1 rounded mt-1 bg-gray-700" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
      )}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={hasStart} onChange={(e) => setHasStart(e.target.checked)} />
        Выключить дату начала
      </label>

      {/* Дата окончания */}
      <div className="bg-gray-900 p-2 rounded space-y-2">
        <label className="block font-medium">Дата окончания</label>
        <Calendar onChange={(v) => setEndDate(v as Date)} value={endDate} />
        <input type="time" className="p-1 rounded mt-1 bg-gray-700" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      {/* Однократное повторение */}
      {repeatMode === "once" && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <label className="block font-medium">Дата повторения</label>
          <Calendar onChange={(v) => setRepeatDate(v as Date)} value={repeatDate} />
          <input type="time" className="p-1 rounded mt-1 bg-gray-700" value={repeatTime} onChange={(e) => setRepeatTime(e.target.value)} />
        </div>
      )}

      {/* Повторение по неделям */}
      {repeatMode === "weekly" && (
        <div className="bg-gray-900 p-2 rounded space-y-2">
          <span>Выберите дни недели</span>
          <div className="flex gap-1 flex-wrap">
            {weekDays.map((d, i) => (
              <button key={i} type="button" className={`px-2 py-1 rounded ${daysOfWeek.includes(i) ? "bg-blue-500 text-white" : "bg-gray-700"}`} onClick={() => toggleDay(i)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Уведомление */}
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={notification} onChange={(e) => setNotification(e.target.checked)} />
        <span>Уведомление</span>
      </div>

      {/* Приоритет */}
      <div>
        <label>Приоритет</label>
        <input type="number"  value={priority === 0 ? "" : priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full p-1 rounded bg-gray-700" />
      </div>

      <button onClick={handleSubmit} className="w-full p-2 bg-blue-600 rounded mt-2">Создать</button>
    </div>
  );
}
