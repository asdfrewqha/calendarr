import type { Message } from "../types/message";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// получить список сообщений за диапазон дат
export async function getMessages(startDate: string, endDate?: string): Promise<Message[]> {
  const params = new URLSearchParams({ start_date: startDate });
  if (endDate) params.append("end_date", endDate);

  const res = await fetch(`${API_URL}/list-msg?${params.toString()}`, {
    credentials: "include", // т.к. у тебя куки с токеном
  });
  if (!res.ok) throw new Error("Ошибка загрузки сообщений");
  return res.json();
}

// создать новое сообщение
export async function createMessage(msg: Omit<Message, "id" | "is_active">): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/create-msg`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  });
  if (!res.ok) throw new Error("Ошибка создания");
  return res.json();
}

// обновить сообщение
export async function updateMessage(id: string, msg: Partial<Message>): Promise<Message> {
  const res = await fetch(`${API_URL}/update-msg/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  });
  if (!res.ok) throw new Error("Ошибка обновления");
  return res.json();
}

// получить одно сообщение
export async function getMessage(id: string): Promise<Message> {
  const res = await fetch(`${API_URL}/get-msg/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка загрузки сообщения");
  return res.json();
}
