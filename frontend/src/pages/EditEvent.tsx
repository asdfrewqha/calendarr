// src/pages/EditEvent.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EventForm from "../components/EventForm";
import type { EventFormData } from "../components/EventForm";
import { getEvent, updateEvent } from "../api/events";
import { formatDateTimeUTC } from "../utils/dateUtils";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<EventFormData>>();

  useEffect(() => {
    if (!id) return;
    getEvent(id).then((data) => {
      setInitialData({
        name: data.name,
        payload: data.payload,
        type: data.type,
        priority: data.priority,
        notification: data.notification,
        hasStart: !!data.start_send_date,
        startDate: data.start_send_date ? new Date(data.start_send_date) : undefined,
        startTime: data.start_send_date ? new Date(data.start_send_date).toTimeString().slice(0, 5) : "00:00",
        endDate: new Date(data.end_send_date),
        endTime: new Date(data.end_send_date).toTimeString().slice(0, 5),
        repeatMode: data.repeat_date ? "once" : data.repeat_wd?.length ? "weekly" : "none",
        repeatDate: data.repeat_date ? new Date(data.repeat_date) : undefined,
        repeatTime: data.repeat_date ? new Date(data.repeat_date).toTimeString().slice(0, 5) : "00:00",
        daysOfWeek: data.repeat_wd ?? [],
      });
    });
  }, [id]);

  const handleSubmit = async (data: EventFormData) => {
    if (!id) return;
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

    await updateEvent(id, eventData);
    navigate("/");
  };

  if (!initialData) return <div>Загрузка...</div>;

  return <EventForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Сохранить изменения" />;
}
