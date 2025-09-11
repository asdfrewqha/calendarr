// src/pages/CreateEvent.tsx
import { useNavigate } from "react-router-dom";
import EventForm from "../components/EventForm";
import type { EventFormData } from "../components/EventForm";
import { createEvent } from "../api/events";
import { formatDateTimeUTC } from "../utils/dateUtils";

export default function CreateEvent() {
  const navigate = useNavigate();

  const handleSubmit = (data: EventFormData) => {
    const eventData: any = {
      name: data.name,
      payload: data.payload,
      type: data.type,
      priority: data.priority,
      notification: data.notification,
      repeat: data.repeatMode !== "none",
    };

    if (data.repeatMode === "none") {
      if (data.hasStart) eventData.start_send_date = formatDateTimeUTC(data.startDate!, data.startTime);
      eventData.end_send_date = formatDateTimeUTC(data.endDate, data.endTime);
    } else if (data.repeatMode === "once") {
      if (data.hasStart) eventData.start_send_date = formatDateTimeUTC(data.startDate!, data.startTime);
      eventData.end_send_date = formatDateTimeUTC(data.endDate, data.endTime);
      eventData.repeat_date = formatDateTimeUTC(data.repeatDate!, data.repeatTime);
    } else if (data.repeatMode === "weekly") {
      if (data.hasStart) eventData.start_send_date = formatDateTimeUTC(data.startDate!, data.startTime);
      eventData.end_send_date = formatDateTimeUTC(data.endDate, data.endTime);
      eventData.repeat_wd = data.daysOfWeek;
    }

    createEvent(eventData);
    navigate("/");
  };

  return <EventForm onSubmit={handleSubmit} submitLabel="Создать" />;
}
