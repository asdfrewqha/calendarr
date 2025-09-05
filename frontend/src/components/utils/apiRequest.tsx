let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

function getAccessToken(): string | null {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
}


async function refreshToken(): Promise<void> {
    const response = await fetch('https://api.donor.vickz.ru/api/refresh', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }
}

interface ApiRequestOptions {
    url: string;
    method?: string;
    params?: Record<string, string | number>;
    body?: Record<string, any> | null;
    auth?: boolean;
    retry?: boolean;
    headers?: Record<string, string>;
}

async function apiRequest({
    url,
    method = 'GET',
    params = {},
    body = null,
    auth = false,
    retry = true,
    headers = {
        'Content-Type': 'application/json',
    }
}: ApiRequestOptions): Promise<Response> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const finalHeaders = { ...headers };

    const options: RequestInit = {
        method,
        headers: finalHeaders,
        credentials: auth ? 'include' : 'omit', // Включаем cookies для аутентифицированных запросов
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(fullUrl, options);

    if (response.status === 401 && auth && retry) {
        try {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken();
            }

            await refreshPromise;
            isRefreshing = false;

            // Повторяем оригинальный запрос после обновления токена
            response = await fetch(fullUrl, options);
        } catch (error) {
            // Очищаем cookies при ошибке обновления
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            if (!window.location.href.endsWith('login')) {
                localStorage.setItem('location_after_login', window.location.href);
            }
            window.location.href = '/#/';
            throw error;
        }
    }

    return response;
}

// Дополнительные утилиты для работы с аутентификацией
export function isAuthenticated(): boolean {
    return getAccessToken() !== null;
}

export function getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
}

export default apiRequest;
