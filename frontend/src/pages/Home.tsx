import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getEvents } from "../api/events";
import EventCard from "../components/EventCard";

type SortOption = "date" | "priority";

export default function Home() {
  const [dateRange, setDateRange] = useState<Date | Date[]>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  useEffect(() => {
    const load = async () => {
      let start: string;
      let end: string | undefined;

      if (Array.isArray(dateRange)) {
        start = dateRange[0].toISOString().split("T")[0];
        end = dateRange[1]?.toISOString().split("T")[0];
      } else {
        start = dateRange.toISOString().split("T")[0];
        end = new Date(dateRange.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      }

      const data = await getEvents(start, end);
      let sorted = [...(data || [])];

      if (sortBy === "priority") {
        sorted.sort((a, b) => b.priority - a.priority);
      } else {
        sorted.sort(
          (a, b) =>
            new Date(a.end_send_date).getTime() -
            new Date(b.end_send_date).getTime()
        );
      }

      setEvents(sorted);
    };
    load();
  }, [dateRange, sortBy]);

  const selectedDateText = Array.isArray(dateRange)
    ? `${dateRange[0].toLocaleDateString()} — ${
        dateRange[1]?.toLocaleDateString() || ""
      }`
    : dateRange.toLocaleDateString();

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      {/* Календарь */}
      <div className="bg-gray-800 p-3 rounded-xl shadow">
        <Calendar
            onChange={(value) => setDateRange(value as Date | [Date, Date])}
            value={dateRange as Date | [Date, Date]}
            selectRange={true}
            className="rounded-xl text-black"
        />

      </div>

      {/* Фильтры */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">События {selectedDateText}</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-gray-700 text-white rounded p-2"
        >
          <option value="date">По дате</option>
          <option value="priority">По важности</option>
        </select>
      </div>

      {/* События */}
      {events.length === 0 && (
        <p className="text-gray-400 text-center">Нет событий</p>
      )}

      <div className="space-y-2">
        {events.map((event) => (
            <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.end_send_date}
                description={event.description}
                type={event.type}
                priority={event.priority}
            />
        ))}

      </div>
    </div>
  );
}
