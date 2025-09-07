import { Link } from "react-router-dom";

type Props = {
  id: string;
  title: string;
  date: string;
  description?: string;
  type?: string;
  priority?: number;
};

export default function EventCard({
  id,
  title,
  date,
  description,
  type,
  priority,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-gray-500">
          {new Date(date).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {description && <p className="text-gray-600 mt-2">{description}</p>}

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        {type && <span className="px-2 py-1 bg-gray-100 rounded">{type}</span>}
        {priority !== undefined && (
          <span className="px-2 py-1 bg-gray-100 rounded">
            Приоритет {priority}
          </span>
        )}
      </div>

      <div className="mt-3">
        <Link
          to={`/edit/${id}`}
          className="text-sm text-tg hover:underline font-medium"
        >
          ✏️ Редактировать
        </Link>
      </div>
    </div>
  );
}
