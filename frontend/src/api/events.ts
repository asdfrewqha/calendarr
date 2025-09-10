const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function listEvents(start_date: string, end_date?: string) {
  const url = new URL(`${API_URL}/list-msg`);
  url.searchParams.set("start_date", start_date);
  if (end_date) url.searchParams.set("end_date", end_date);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error("Ошибка загрузки событий");
  return res.json();
}

export async function createEvent(data: any) {
  const res = await fetch(`${API_URL}/create-msg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEvent(id: string, data: any) {
  const res = await fetch(`${API_URL}/update-msg/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getEvent(id: string) {
  const res = await fetch(`${API_URL}/get-msg/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка загрузки события");
  return res.json();
}

export async function getEvents(start: string, end?: string) {
  const url = new URL(`${API_URL}/list-msg`);
  url.searchParams.append("start_date", start);
  if (end) url.searchParams.append("end_date", end);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function delEvent(id: string) {
  await fetch(`${API_URL}/del-msg/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
}
