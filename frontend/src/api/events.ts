const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function createEvent(data: any) {
  const res = await fetch(`${API_URL}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEvent(id: string, data: any) {
  const res = await fetch(`${API_URL}/message/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getEvent(id: string) {
  const res = await fetch(`${API_URL}/message/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка загрузки события");
  return res.json();
}

export async function getEvents(start: string, end?: string) {
  const url = new URL(`${API_URL}/message`);
  url.searchParams.append("start_date", start);
  if (end) url.searchParams.append("end_date", end);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function delEvent(id: string) {
  await fetch(`${API_URL}/message/${id}`, {
    method: "DELETE",
    credentials: "include"
  })
}
