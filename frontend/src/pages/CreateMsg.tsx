import { useState } from "react";
import apiRequest from "../components/utils/apiRequest";

type MessageType = "TEXT" | "NOTIF" | "EVENT" | "TASK" | "ARRAY";

export default function CreateMsg() {
  // Основные поля
  const [name, setName] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("TEXT");
  const [startSendDate, setStartSendDate] = useState("");
  const [startSendTime, setStartSendTime] = useState("");
  const [endSendDate, setEndSendDate] = useState("");
  const [endSendTime, setEndSendTime] = useState("");
  const [notification, setNotification] = useState(true);
  const [priority, setPriority] = useState(5);

  // Повторения
  const [repeat, setRepeat] = useState(false);
  const [repeatDate, setRepeatDate] = useState("");
  const [repeatTime, setRepeatTime] = useState("");
  const [repeatWd, setRepeatWd] = useState<number[]>([]);

  // Payload в зависимости от типа
  const [textContent, setTextContent] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventPlace, setEventPlace] = useState("ЦК ФМБА");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [arrayItems, setArrayItems] = useState([""]);

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!name || !endSendDate || !endSendTime) {
      alert("Пожалуйста, заполните обязательные поля: название и дата окончания");
      return;
    }

    // Формирование дат
    const end_send_date = new Date(`${endSendDate}T${endSendTime}`).toISOString();
    const start_send_date = startSendDate && startSendTime
      ? new Date(`${startSendDate}T${startSendTime}`).toISOString()
      : null;

    const repeat_date = repeatDate && repeatTime
      ? new Date(`${repeatDate}T${repeatTime}`).toISOString()
      : null;

    // Формирование payload в зависимости от типа
    let payload = {};
    switch (messageType) {
      case "TEXT":
        payload = { content: textContent };
        break;
      case "NOTIF":
        payload = { content: textContent };
        break;
      case "EVENT":
        payload = {
          title: eventTitle,
          description: eventDescription,
          place: eventPlace
        };
        break;
      case "TASK":
        payload = {
          title: taskTitle,
          description: taskDescription
        };
        break;
      case "ARRAY":
        payload = {
          items: arrayItems.filter(item => item.trim() !== "")
        };
        break;
    }

    const requestData = {
      name,
      payload,
      start_send_date,
      end_send_date,
      type: messageType,
      notification,
      priority,
      repeat,
      repeat_date: repeat ? repeat_date : null,
      repeat_wd: repeat && repeatWd.length > 0 ? repeatWd : null
    };

    try {
      const response = await apiRequest({
        url: "https://api.asdfrewqha.ru/api/create-msg",
        method: "POST",
        body: requestData,
        auth: true,
      });

      if (response.ok) {
        alert("Сообщение успешно создано!");
        // Сброс формы
        setName("");
        setTextContent("");
        setEndSendDate("");
        setEndSendTime("");
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.message || "Не удалось создать сообщение"}`);
      }
    } catch (err) {
      alert("Ошибка при отправке запроса");
    }
  };

  const toggleWeekDay = (day: number) => {
    if (repeatWd.includes(day)) {
      setRepeatWd(repeatWd.filter(d => d !== day));
    } else {
      setRepeatWd([...repeatWd, day]);
    }
  };

  const addArrayItem = () => {
    setArrayItems([...arrayItems, ""]);
  };

  const removeArrayItem = (index: number) => {
    setArrayItems(arrayItems.filter((_, i) => i !== index));
  };

  const updateArrayItem = (index: number, value: string) => {
    const newItems = [...arrayItems];
    newItems[index] = value;
    setArrayItems(newItems);
  };

  return (
    <div className="p-6 py-20 h-full max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">
        Создание сообщения
      </h1>

      <div className="space-y-5">
        {/* Обязательные поля */}
        <div>
          <label className="block text-gray-700 mb-2">Название *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название сообщения"
            className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Тип сообщения *</label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as MessageType)}
            className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="TEXT">Текст</option>
            <option value="NOTIF">Уведомление</option>
            <option value="EVENT">Мероприятие</option>
            <option value="TASK">Задача</option>
            <option value="ARRAY">Список</option>
          </select>
        </div>

        {/* Поля в зависимости от типа */}
        {messageType === "TEXT" || messageType === "NOTIF" ? (
          <div>
            <label className="block text-gray-700 mb-2">Текст сообщения</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Введите текст сообщения"
              className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={4}
            />
          </div>
        ) : messageType === "EVENT" ? (
          <>
            <div>
              <label className="block text-gray-700 mb-2">Название мероприятия</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Название мероприятия"
                className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Описание</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Описание мероприятия"
                className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Место проведения</label>
              <select
                value={eventPlace}
                onChange={(e) => setEventPlace(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="ЦК ФМБА">ЦК ФМБА</option>
                <option value="ЦК им. Гаврилова">ЦК им. Гаврилова</option>
              </select>
            </div>
          </>
        ) : messageType === "TASK" ? (
          <>
            <div>
              <label className="block text-gray-700 mb-2">Название задачи</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Название задачи"
                className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Описание задачи</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Описание задачи"
                className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={3}
              />
            </div>
          </>
        ) : messageType === "ARRAY" ? (
          <div>
            <label className="block text-gray-700 mb-2">Элементы списка</label>
            {arrayItems.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(index, e.target.value)}
                  placeholder={`Элемент ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {arrayItems.length > 1 && (
                  <button
                    onClick={() => removeArrayItem(index)}
                    className="px-3 bg-red-500 text-white rounded-xl"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addArrayItem}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-xl"
            >
              + Добавить элемент
            </button>
          </div>
        ) : null}

        {/* Даты отправки */}
        <div>
          <label className="block text-gray-700 mb-2">Дата начала отправки (опционально)</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startSendDate}
              onChange={(e) => setStartSendDate(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-blue-300 text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="time"
              value={startSendTime}
              onChange={(e) => setStartSendTime(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Дата окончания отправки *</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={endSendDate}
              onChange={(e) => setEndSendDate(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-blue-300 text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="time"
              value={endSendTime}
              onChange={(e) => setEndSendTime(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Настройки уведомлений */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notification}
            onChange={(e) => setNotification(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-700">Уведомление</label>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Приоритет (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Настройки повторений */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-700">Повторять</label>
        </div>

        {repeat && (
          <>
            <div>
              <label className="block text-gray-700 mb-2">Дата повторения (опционально)</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={repeatDate}
                  onChange={(e) => setRepeatDate(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-blue-300 text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="time"
                  value={repeatTime}
                  onChange={(e) => setRepeatTime(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Дни недели для повторения</label>
              <div className="grid grid-cols-7 gap-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleWeekDay(index)}
                    className={`p-2 rounded-xl border ${
                      repeatWd.includes(index)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
        >
          Создать сообщение
        </button>
      </div>
    </div>
  );
}
