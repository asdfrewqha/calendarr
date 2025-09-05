import { useState, useEffect } from 'react';
import './App.css';

interface AuthResponse {
  message: string;
  status: string;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getInitData = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tgWebAppData');
  };

  const authenticateUser = async (initData: string) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('initData', initData);

      const response = await fetch('https://api.asdfrewqha.ru/api/get-token', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      if (data.status === 'success') {
        setSuccess(true);
        setError(null);
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        
      } else {
        throw new Error(data.message || 'Неизвестная ошибка аутентификации');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const accessToken = document.cookie.includes('access_token');
    const refreshToken = document.cookie.includes('refresh_token');
    return accessToken && refreshToken;
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    const initData = getInitData();
    
    if (initData) {
      authenticateUser(initData);
    } else {
      setError('InitData не найден в URL. Откройте приложение через Telegram.');
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Telegram Web App</h1>
        <p>Аутентификация через Telegram</p>
      </header>

      <main className="app-main">
        {error && (
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
        )}

        {success && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h3>Аутентификация успешна!</h3>
            <p>Вы успешно вошли в систему.</p>
            <p>Перенаправление на главную страницу...</p>
            <div className="loading-spinner-small"></div>
          </div>
        )}

        {!error && !success && (
          <div className="info-container">
            <p>Загрузка приложения...</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Secure authentication via Telegram</p>
      </footer>
    </div>
  );
}

export default App;