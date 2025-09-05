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

interface ApiResponse {
  status: string;
  message?: string;
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
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const authenticate = async () => {
      // Проверяем, инициализирован ли Telegram WebApp
      if (!window.Telegram?.WebApp) {
        setError('Telegram Web App не инициализирован');
        setLoading(false);
        setDebugInfo('Объект Telegram не найден в window. Откройте приложение через Telegram.');
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();

      const formData = new URLSearchParams();
      formData.append('initData', tg.initData);

      try {
        const response = await fetch('https://api.asdfrewqha.ru/api/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
          credentials: 'include'
        });

        // Сохраняем информацию для отладки
        const responseText = await response.text();
        setDebugInfo(`Status: ${response.status}, Response: ${responseText}`);

        let data: ApiResponse;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Неверный JSON-ответ: ${responseText}`);
        }

        console.log('Response data:', data);

        // ИСПРАВЛЕНИЕ: проверяем поле status вместо ok
        if (response.ok && data.status === "success") {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/#/main';
          }, 2000);
        } else {
          setError(data.message || 'Ошибка авторизации: неверный ответ сервера');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Не удалось получить токены: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
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

            {/* Добавляем отладочную информацию */}
            {debugInfo && (
              <details className="debug-info">
                <summary>Детали ошибки (для разработки)</summary>
                <pre>{debugInfo}</pre>
              </details>
            )}

            <div className="button-group">
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

  return null;
}
