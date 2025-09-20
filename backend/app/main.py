# main.py
from contextlib import asynccontextmanager

from app.core.broker import broker
from app.core.log_middleware import LoggingMiddleware
from app.core.logging import setup_logging
from app.core.routers_loader import include_all_routers
from app.core.settings import settings
from app.database.adapter import adapter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    await adapter.initialize_tables()
    if not broker.is_worker_process:
        await broker.startup()
    yield


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title="FastAPI",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
        swagger_ui_parameters={"withCredentials": True},
    )

    include_all_routers(app)
    app.add_middleware(LoggingMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()


@app.get("/")
async def redirect():
    return RedirectResponse("/docs")
