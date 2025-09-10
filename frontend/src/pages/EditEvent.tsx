import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MessageType } from "../types";
import { getEvent, updateEvent } from "../api/events";

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MessageType>(MessageType.EVENT);
  const [priority, setPriority] = useState(5);
  const [notification, setNotification] = useState(true);

  const [repeatMode, setRepeatMode] = useState<"none" | "once" | "weekly">("none");

  const [hasStart, setHasStart] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");

  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState("10:00");

  const [repeatDate, setRepeatDate] = useState(new Date());
  const [repeatTime, setRepeatTime] = useState("09:00");

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [weeklyTime, setWeeklyTime] = useState("09:00");

  useEffect(() => {
    if (!id) return;
    getEvent(id).then((data) => {
      setTitle(data.name || "");
      setDescription(data.payload?.description || "");
      setType(data.type as MessageType);
      setPriority(data.priority);
      setNotification(data.notification);

      // восстановление дат
      if (data.start_send_date) {
        setHasStart(true);
        const s = new Date(data.start_send_date);
        setStartDate(s);
        setStartTime(s.toISOString().slice(11, 16));
      } else {
        setHasStart(false);
      }

      if (data.end_send_date) {
        const e = new Date(data.end_send_date);
        setEndDate(e);
        setEndTime(e.toISOString().slice(11, 16));
      }

      if (data.repeat_date) {
        setRepeatMode("once");
        const r = new Date(data.repeat_date);
        setRepeatDate(r);
        setRepeatTime(r.toISOString().slice(11, 16));
      } else if (data.repeat_wd) {
        setRepeatMode("weekly");
        setDaysOfWeek(data.repeat_wd || []);
        setWeeklyTime(data.repeat_time || "09:00");
      } else {
        setRepeatMode("none");
      }

      setLoading(false);
    });
  }, [id]);

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

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!id) return;

    const eventData: any = {
      name: title,
      payload: description ? { description } : undefined,
      type,
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
      eventData.start_send_date = undefined;
      eventData.end_send_date = formatDateTime(endDate, endTime);
      eventData.repeat_date = undefined;
      eventData.repeat_wd = daysOfWeek;
      eventData.repeat_time = weeklyTime;
    }

    await updateEvent(id, eventData);
    navigate("/");
  };

  if (loading) return <p className="text-center text-gray-400">Загрузка...</p>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-gray-800 rounded-xl text-white">
      <h2 className="text-xl font-bold">Редактировать событие</h2>

      {/* Тип */}
      <div>
        <label className="block mb-1">Тип события</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MessageType)}
          className="w-full p-2 rounded bg-gray-700"
        >
          {Object.values(MessageType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
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

      {/* Повторение */}
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
        Выключить дату начала
      </label>

      {/* Дата окончания */}
      <div className="bg-gray-900 p-2 rounded space-y-2">
        <label className="block font-medium">Дата окончания</label>
        <Calendar onChange={(v) => setEndDate(v as Date)} value={endDate} />
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
          <Calendar onChange={(v) => setRepeatDate(v as Date)} value={repeatDate} />
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
          <label className="block mb-1 font-medium">Время события</label>
          <input
            type="time"
            className="p-1 rounded mt-1 bg-gray-700"
            value={weeklyTime}
            onChange={(e) => setWeeklyTime(e.target.value)}
          />
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
          min={1}
          max={5}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full p-1 rounded bg-gray-700"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full p-2 bg-blue-600 rounded mt-2"
      >
        Сохранить
      </button>
    </div>
  );
}
