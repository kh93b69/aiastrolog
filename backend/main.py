import os
import secrets
import traceback
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import database as db
import ai_service
import astro_service

app = FastAPI(title="Novella API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Путь к собранному фронтенду
STATIC_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

# Секретный ключ для защищённых эндпоинтов (cron)
ADMIN_SECRET = os.getenv("ADMIN_SECRET", secrets.token_hex(32))


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
    spread_type: str = "past_present_future"  # или "category"
    category: Optional[str] = None  # "relationships", "work_money", "self_discovery"


class HoroscopeRequest(BaseModel):
    telegram_id: int


class NatalChartRequest(BaseModel):
    telegram_id: int


class ReferralRequest(BaseModel):
    telegram_id: int  # кто пришёл по ссылке
    referrer_id: int   # кто пригласил


# === Эндпоинты ===

@app.get("/health")
def health():
    return {"status": "ok", "app": "Novella", "version": "4"}


@app.get("/debug/astro")
def debug_astro():
    """Проверка работы kerykeion"""
    try:
        test_data = astro_service.calculate_natal_chart("2000-01-01", "12:00", "Moscow")
        return {"status": "ok", "sun_sign": test_data["sun_sign"]}
    except Exception as e:
        return {"status": "error", "error": str(e), "type": type(e).__name__}


@app.post("/api/user/register")
def register_user(data: UserCreate):
    """Регистрация пользователя (или возврат существующего)"""
    user = db.get_user(data.telegram_id)
    if user:
        limits = db.get_user_limits(data.telegram_id)
        if not limits:
            limits = db.create_user_limits(data.telegram_id)
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


@app.post("/api/natal-chart")
def get_natal_chart(data: NatalChartRequest):
    """Рассчитать натальную карту и получить интерпретацию"""
    user = db.get_user(data.telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if not user.get("onboarding_done"):
        raise HTTPException(status_code=400, detail="Заполните профиль")

    try:
        # Рассчитываем натальную карту
        natal_data = astro_service.calculate_natal_chart(
            user["birth_date"], user["birth_time"], user["birth_place"]
        )
    except Exception as e:
        print(f"Ошибка расчёта натальной карты: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка расчёта карты: {str(e)}")

    try:
        # Генерируем описание от ИИ
        reading = ai_service.generate_natal_chart_reading(natal_data)
    except Exception as e:
        print(f"Ошибка генерации описания: {e}")
        # Если ИИ не работает — отдаём карту без описания
        reading = None

    return {
        "natal_chart": natal_data,
        "reading": reading,
    }


@app.post("/api/horoscope")
def get_horoscope(data: HoroscopeRequest):
    """Получить астрологический прогноз на основе натальной карты и транзитов"""
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

    # Генерация прогноза с реальными транзитами
    try:
        horoscope = ai_service.generate_horoscope(
            user["birth_date"], user["birth_time"], user["birth_place"]
        )
    except Exception as e:
        print(f"Ошибка генерации прогноза: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка генерации прогноза: {str(e)}")

    # Обновляем счётчик
    new_limits = db.increment_usage(data.telegram_id, "horoscope")

    # Сохраняем в историю
    db.save_reading(data.telegram_id, "horoscope", "Звёздный чек-ап", horoscope)

    return {"horoscope": horoscope, "limits": new_limits}


@app.post("/api/tarot")
def get_tarot_reading(data: TarotRequest):
    """Получить расклад Астро-Таро"""
    # Валидация входных данных
    allowed_spread_types = {"past_present_future", "category"}
    allowed_categories = {"relationships", "work_money", "self_discovery", None}
    if data.spread_type not in allowed_spread_types:
        raise HTTPException(status_code=400, detail="Неизвестный тип расклада")
    if data.category not in allowed_categories:
        raise HTTPException(status_code=400, detail="Неизвестная категория")
    if len(data.question) > 500:
        raise HTTPException(status_code=400, detail="Вопрос слишком длинный")

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
        cards=cards,
        question=data.question,
        birth_date=user.get("birth_date"),
        birth_time=user.get("birth_time"),
        birth_place=user.get("birth_place"),
        spread_type=data.spread_type,
        category=data.category,
    )

    # Обновляем счётчик
    new_limits = db.increment_usage(data.telegram_id, "tarot")

    # Сохраняем в историю
    db.save_reading(data.telegram_id, "tarot", data.question, reading, cards)

    return {"cards": cards, "reading": reading, "limits": new_limits}


@app.get("/api/readings/{telegram_id}")
def get_readings(telegram_id: int):
    """Получить историю последних раскладов и прогнозов"""
    readings = db.get_readings(telegram_id, limit=5)
    return {"readings": readings}


@app.post("/api/referral")
def process_referral(data: ReferralRequest):
    """Обработать реферальную ссылку — начислить бонус пригласившему"""
    if data.referrer_id == data.telegram_id:
        raise HTTPException(status_code=400, detail="Нельзя пригласить себя")

    referrer = db.get_user(data.referrer_id)
    if not referrer:
        raise HTTPException(status_code=404, detail="Пригласивший не найден")

    # Проверяем, что у текущего пользователя ещё нет referrer_id (бонус только 1 раз)
    current_user = db.get_user(data.telegram_id)
    if current_user and current_user.get("referrer_id"):
        return {"status": "already_referred"}

    # Записываем реферера и начисляем бонус
    db.set_referrer(data.telegram_id, data.referrer_id)
    new_limits = db.add_referral_bonus(data.referrer_id)
    return {"status": "ok", "limits": new_limits}


@app.post("/api/limits/reset")
def reset_limits(x_admin_secret: Optional[str] = Header(None)):
    """Сброс лимитов (вызывать по понедельникам через cron, требует секрет)"""
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    db.reset_all_limits()
    return {"status": "ok", "message": "Лимиты сброшены"}


# Раздача фронтенда — статика и SPA fallback
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/")
    def serve_index():
        """Главная страница — без кеша чтобы Telegram подтягивал свежую версию"""
        response = FileResponse(os.path.join(STATIC_DIR, "index.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        return response

    @app.get("/{path:path}")
    def serve_frontend(path: str):
        """Отдаём файл или index.html для SPA"""
        file_path = os.path.normpath(os.path.join(STATIC_DIR, path))
        # Защита от path traversal (../../../etc/passwd)
        if not file_path.startswith(STATIC_DIR):
            response = FileResponse(os.path.join(STATIC_DIR, "index.html"))
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            return response
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        response = FileResponse(os.path.join(STATIC_DIR, "index.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        return response
