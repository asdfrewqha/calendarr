// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import type { Message } from "../types/message";
import { MessageType } from "../types/message";
import { getToken } from "../api/auth";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../api/messages";
import MessageForm from "../components/MessageForm";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  // Получаем initData из Telegram через SDK и авторизуемся
  useEffect(() => {
    const { initData } = retrieveLaunchParams();
    if (!initData) {
      console.error("Telegram initData отсутствует!");
      return;
    }

    getToken({ initData })
      .then(() => console.log("Авторизация успешна"))
      .catch((err) => console.error("Ошибка авторизации:", err));
  }, []);

  // Загружаем сообщения после авторизации
  useEffect(() => {
    async function fetchMessages() {
      try {
        const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        const msgs = await getMessages(today); // берём startDate
        setMessages(msgs);
      } catch (e) {
        console.error("Ошибка загрузки сообщений:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  const handleSave = async (msg: Omit<Message, "id"> | Message) => {
    try {
      if ("id" in msg && msg.id) {
        const updated = await updateMessage(msg.id, msg);
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        const created = await createMessage(msg as Omit<Message, "id">);
        const fullMsg: Message = {
          ...msg,
          id: created.id,
          end_send_date: msg.end_send_date,
          type: msg.type ?? MessageType.TEXT,
          notification: msg.notification ?? true,
          is_active: msg.is_active ?? true,
          priority: msg.priority ?? 5,
          repeat: msg.repeat ?? false,
          start_send_date: msg.start_send_date,
          repeat_date: msg.repeat_date,
          repeat_wd: msg.repeat_wd,
        };
        setMessages((prev) => [...prev, fullMsg]);
      }
      setSelectedMessage(null);
    } catch (e) {
      console.error("Ошибка сохранения:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error("Ошибка удаления:", e);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Мероприятия</h1>

      <MessageForm initial={selectedMessage ?? undefined} onSave={handleSave} />

      <ul className="mt-6 flex flex-col gap-3">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{msg.name}</div>
              <div className="text-sm text-gray-500">
                {msg.end_send_date} — {msg.type}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-500"
                onClick={() => setSelectedMessage(msg)}
              >
                Редактировать
              </button>
              <button
                className="text-red-500"
                onClick={() => msg.id && handleDelete(msg.id)}
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
