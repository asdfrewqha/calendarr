import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getEvents } from "../api/events";
import EventCard from "../components/EventCard";

type SortOption = "date-asc" | "date-desc" | "priority-asc" | "priority-desc";

export default function Home() {
  const [dateRange, setDateRange] = useState<Date | Date[]>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date-asc");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // --------------------- Получение профиля ---------------------
  const loadProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, { credentials: "include" });
      const data = await res.json();
      setNotificationsEnabled(data.notifications_bool);
    } catch (err) {
      console.error("Ошибка получения профиля:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // --------------------- Переключение уведомлений ---------------------
  const toggleNotifications = async () => {
    setLoadingToggle(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/user-notification/`, { credentials: "include" });
      setNotificationsEnabled((prev) => !prev);
    } catch (err) {
      console.error("Ошибка переключения уведомлений:", err);
    } finally {
      setLoadingToggle(false);
    }
  };

  // --------------------- Сортировка событий ---------------------
  const sortEvents = (arr: any[], sortBy: SortOption) => {
    return [...arr].sort((a, b) => {
      switch (sortBy) {
        case "priority-asc": return a.priority - b.priority;
        case "priority-desc": return b.priority - a.priority;
        case "date-asc": return new Date(a.end_send_date).getTime() - new Date(b.end_send_date).getTime();
        case "date-desc": return new Date(b.end_send_date).getTime() - new Date(a.end_send_date).getTime();
        default: return 0;
      }
    });
  };

  // --------------------- Загрузка событий ---------------------
  const loadEvents = async () => {
    let start: string;
    let end: string | undefined;

    if (Array.isArray(dateRange)) {
      start = dateRange[0].toISOString().split("T")[0];
      end = dateRange[1]?.toISOString().split("T")[0];
    } else {
      start = dateRange.toISOString().split("T")[0];
      end = new Date(dateRange.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }

    const data = await getEvents(start, end);
    setEvents(sortEvents(data || [], sortBy));
  };

  useEffect(() => {
    loadEvents();
  }, [dateRange, sortBy]);

  // --------------------- SSE подписка ---------------------
  useEffect(() => {
    const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/message-stream`, { withCredentials: true });

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => {
        switch (data.event) {
          case "message_created":
            if (!prev.find((e) => e.id === data.id)) return sortEvents([...prev, data], sortBy);
            return prev;
          case "message_updated":
            return sortEvents(
              prev.map((e) => {
                if (e.id !== data.id) return e;
                const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null && v !== undefined));
                return { ...e, ...cleanData };
              }),
              sortBy
            );
          case "message_deleted":
            return prev.filter((e) => e.id !== data.id);
          default:
            return prev;
        }
      });
    };

    return () => evtSource.close();
  }, [sortBy]);

  const selectedDateText = Array.isArray(dateRange)
    ? `${dateRange[0].toLocaleDateString()} — ${dateRange[1]?.toLocaleDateString() || ""}`
    : dateRange.toLocaleDateString();

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      {/* --------------------- Колокольчик уведомлений --------------------- */}
      <div className="flex justify-end">
        <button
          onClick={toggleNotifications}
          disabled={loadingToggle}
          className={`p-2 rounded-full text-white text-xl ${
            notificationsEnabled ? "bg-green-600" : "bg-red-600"
          }`}
          title={notificationsEnabled ? "Уведомления включены" : "Уведомления отключены"}
        >
          🔔
        </button>
      </div>

      {/* --------------------- Календарь --------------------- */}
      <div className="bg-gray-800 p-3 rounded-xl shadow">
        <Calendar
          onChange={(value) => setDateRange(value as Date | [Date, Date])}
          value={dateRange as Date | [Date, Date]}
          selectRange={true}
          className="rounded-xl text-black"
        />
      </div>

      {/* --------------------- Фильтры --------------------- */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">События {selectedDateText}</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-gray-700 text-white rounded p-2"
        >
          <option value="date-asc">Дата ↑</option>
          <option value="date-desc">Дата ↓</option>
          <option value="priority-asc">Приоритет ↑</option>
          <option value="priority-desc">Приоритет ↓</option>
        </select>
      </div>

      {/* --------------------- События --------------------- */}
      {events.length === 0 && <p className="text-gray-400 text-center">Нет событий</p>}

      <div className="space-y-2">
        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            name={event.name}
            date={event.end_send_date}
            payload={event.payload}
            type={event.type}
            priority={event.priority}
            is_active={event.is_active}
            onDeleted={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
