import hmac
import json
import time
from hashlib import sha256
from urllib.parse import urlencode

import aiohttp
from core.config import BACKEND_URL, BOT_TOKEN
from models.redis_adapter import redis_adapter


def create_init_data(user_id: int, username: str = None) -> str:
    auth_date = int(time.time())

    user_data = {"id": user_id}
    if username:
        user_data["username"] = username

    init_data = {"user": json.dumps(user_data, separators=(",", ":")), "auth_date": str(auth_date)}

    check_string = "\n".join(f"{k}={v}" for k, v in sorted(init_data.items()))
    secret_key = hmac.new("WebAppData".encode(), BOT_TOKEN.encode(), sha256).digest()
    hash_ = hmac.new(secret_key, check_string.encode(), sha256).hexdigest()

    init_data["hash"] = hash_

    return urlencode(init_data)


async def get_access_cookies(chat_id: int, chat_username: str = None):
    access = await redis_adapter.get(f"access_token:{chat_id}")
    refresh = await redis_adapter.get(f"refresh_token:{chat_id}")
    if access:
        return {"access_token": access, "refresh_token": refresh}
    elif refresh:
        async with aiohttp.ClientSession(
            cookies={"access_token": access, "refresh_token": refresh}
        ) as session:
            async with session.get(f"{BACKEND_URL}/refresh") as response:
                if response.status != 200:
                    raise Exception(f"Token request failed: {response.status}")
                cookies = {}
                for cookie_name, cookie_value in response.cookies.items():
                    cookies[cookie_name] = cookie_value.value
                return cookies
    else:
        init_data = create_init_data(chat_id, chat_username)
        async with aiohttp.ClientSession() as session:
            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            data = {"initData": init_data}
            async with session.post(f"{BACKEND_URL}/login", data=data, headers=headers) as response:
                if response.status != 200:
                    raise Exception(f"Token request failed: {response.status}")
                cookies = {}
                for cookie_name, cookie_value in response.cookies.items():
                    cookies[cookie_name] = cookie_value.value
                    await redis_adapter.set(f"{cookie_name}:{chat_id}", cookie_value.value)
                return cookies
