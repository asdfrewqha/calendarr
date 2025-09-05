import { useEffect, useState } from 'react';
import './App.css';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  added_to_attachment_menu: boolean;
  allows_write_to_pm: boolean;
  photo_url: string;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        initDataUnsafe: {
          user: TelegramUser;
        };
        initData: string;
      };
    };
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const formData = new URLSearchParams();
      formData.append('initData', tg.initData);

      fetch('https://api.asdfrewqha.ru/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include'
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Ошибка сервера');
          }
          return res.json();
        })
        .then((res) => {
          if (res.ok) {
            setSuccess(true);
            setTimeout(() => {
              window.location.href = '/main';
            }, 2000);
          } else {
            setError('Ошибка авторизации');
          }
          setLoading(false);
        })
        .catch((error) => {
          setError('Не удалось получить токены');
          setLoading(false);
        });
    } else {
      setError('Telegram Web App не инициализирован');
      setLoading(false);
    }
  }, []);

  const openInTelegram = () => {
    const telegramUrl = `https://t.me/your_bot_username/startapp?startapp=webapp`;
    window.open(telegramUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Выполняется аутентификация...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Telegram Web App</h1>
          <p>Аутентификация через Telegram</p>
        </header>
        <main className="app-main">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка аутентификации</h3>
            <p>{error}</p>
            <button onClick={openInTelegram} className="telegram-btn">
              📱 Открыть в Telegram
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              🔄 Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Telegram Web App</h1>
          <p>Аутентификация через Telegram</p>
        </header>
        <main className="app-main">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h3>Аутентификация успешна!</h3>
            <p>Вы успешно вошли в систему.</p>
            <p>Перенаправление на главную страницу...</p>
            <div className="loading-spinner-small"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Telegram Web App</h1>
        <p>Аутентификация через Telegram</p>
      </header>
      <main className="app-main">
        <div className="info-container">
          <p>Загрузка приложения...</p>
        </div>
      </main>
    </div>
  );
}