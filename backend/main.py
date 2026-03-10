import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import database as db
import ai_service

app = FastAPI(title="AI Astrolog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Путь к собранному фронтенду
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


# === Модели запросов ===

class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None


class ProfileUpdate(BaseModel):
    telegram_id: int
    birth_date: str
    birth_time: str
    birth_place: str


class TarotRequest(BaseModel):
    telegram_id: int
    question: str


class HoroscopeRequest(BaseModel):
    telegram_id: int


# === Эндпоинты ===

@app.get("/health")
def health():
    return {"status": "ok", "app": "AI Astrolog"}


@app.post("/api/user/register")
def register_user(data: UserCreate):
    """Регистрация пользователя (или возврат существующего)"""
    user = db.get_user(data.telegram_id)
    if user:
        limits = db.get_user_limits(data.telegram_id)
        return {"user": user, "limits": limits}

    user = db.create_user(data.telegram_id, data.username)
    limits = db.create_user_limits(data.telegram_id)
    return {"user": user, "limits": limits}


@app.post("/api/user/profile")
def update_profile(data: ProfileUpdate):
    """Обновить профиль пользователя (онбординг)"""
    user = db.update_user_profile(
        data.telegram_id, data.birth_date, data.birth_time, data.birth_place
    )
    return {"user": user}


@app.get("/api/user/{telegram_id}")
def get_user(telegram_id: int):
    """Получить данные пользователя"""
    user = db.get_user(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    limits = db.get_user_limits(telegram_id)
    return {"user": user, "limits": limits}


@app.post("/api/horoscope")
def get_horoscope(data: HoroscopeRequest):
    """Получить астрологический прогноз"""
    user = db.get_user(data.telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if not user.get("onboarding_done"):
        raise HTTPException(status_code=400, detail="Заполните профиль для получения прогноза")

    # Проверка лимитов
    limits = db.get_user_limits(data.telegram_id)
    if not limits:
        limits = db.create_user_limits(data.telegram_id)

    if not limits["is_premium"] and limits["horoscope_used"] >= limits["horoscope_limit"]:
        raise HTTPException(status_code=429, detail="Лимит прогнозов исчерпан на этой неделе")

    # Генерация прогноза
    horoscope = ai_service.generate_horoscope(
        user["birth_date"], user["birth_time"], user["birth_place"]
    )

    # Обновляем счётчик
    new_limits = db.increment_usage(data.telegram_id, "horoscope")

    # Сохраняем в историю
    db.save_reading(data.telegram_id, "horoscope", "Прогноз на день", horoscope)

    return {"horoscope": horoscope, "limits": new_limits}


@app.post("/api/tarot")
def get_tarot_reading(data: TarotRequest):
    """Получить расклад Таро"""
    user = db.get_user(data.telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Проверка лимитов
    limits = db.get_user_limits(data.telegram_id)
    if not limits:
        limits = db.create_user_limits(data.telegram_id)

    if not limits["is_premium"] and limits["tarot_used"] >= limits["tarot_limit"]:
        raise HTTPException(status_code=429, detail="Лимит раскладов Таро исчерпан на этой неделе")

    # Вытягиваем карты и генерируем интерпретацию
    cards = ai_service.draw_tarot_cards(3)
    reading = ai_service.generate_tarot_reading(
        cards, data.question, user.get("birth_date")
    )

    # Обновляем счётчик
    new_limits = db.increment_usage(data.telegram_id, "tarot")

    # Сохраняем в историю
    db.save_reading(data.telegram_id, "tarot", data.question, reading, cards)

    return {"cards": cards, "reading": reading, "limits": new_limits}


@app.post("/api/limits/reset")
def reset_limits():
    """Сброс лимитов (вызывать по понедельникам через cron)"""
    db.reset_all_limits()
    return {"status": "ok", "message": "Лимиты сброшены"}


# Раздача фронтенда — статика и SPA fallback
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/")
    def serve_index():
        """Главная страница"""
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    @app.get("/{path:path}")
    def serve_frontend(path: str):
        """Отдаём файл или index.html для SPA"""
        file_path = os.path.join(STATIC_DIR, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
