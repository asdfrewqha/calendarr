// src/utils/dateUtils.ts
export const formatDateTimeUTC = (date: Date, time?: string) => {
  const dt = new Date(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
  } else {
    dt.setHours(0, 0, 0, 0);
  }
  return dt.toISOString();
};

export const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
