const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export interface TelegramAuthBody {
  initData: string;
}

export async function getToken(body: TelegramAuthBody) {
  const res = await fetch(`${API_URL}/get-token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ initData: body.initData }), // 👈 исправлено
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка авторизации");
  return res.json();
}
