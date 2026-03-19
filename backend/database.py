from datetime import datetime, timedelta, timezone
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# === Конфигурация пакетов ===

PACKS = {
    "impulse": {
        "title": "Мистический импульс",
        "description": "1 расклад Таро или 1 прогноз",
        "stars": 25,
        "horoscope_bonus": 1,
        "tarot_bonus": 1,
        "premium_days": 0,
    },
    "vibe_week": {
        "title": "Вайб недели",
        "description": "5 раскладов + безлимит прогнозов на 7 дней",
        "stars": 99,
        "tarot_bonus": 5,
        "premium_days": 7,
    },
    "vip_month": {
        "title": "Подружка Новеллы",
        "description": "Безлимит на всё на 30 дней",
        "stars": 299,
        "horoscope_bonus": 0,
        "tarot_bonus": 0,
        "premium_days": 30,
    },
}


# === Пользователи ===

def get_user(telegram_id: int):
    """Получить пользователя по telegram_id"""
    result = supabase.table("users").select("*").eq("telegram_id", telegram_id).execute()
    if result.data:
        return result.data[0]
    return None


def create_user(telegram_id: int, username: str = None):
    """Создать нового пользователя"""
    data = {"telegram_id": telegram_id, "username": username}
    result = supabase.table("users").insert(data).execute()
    return result.data[0]


def update_user_profile(telegram_id: int, birth_date: str, birth_time: str, birth_place: str):
    """Обновить профиль пользователя (дата, время, место рождения)"""
    data = {
        "birth_date": birth_date,
        "birth_time": birth_time,
        "birth_place": birth_place,
        "onboarding_done": True
    }
    result = supabase.table("users").update(data).eq("telegram_id", telegram_id).execute()
    return result.data[0]


# === Лимиты ===

def get_user_limits(telegram_id: int, auto_reset=True):
    """Получить текущие лимиты пользователя (с автосбросом по неделям)"""
    result = supabase.table("user_limits").select("*").eq("telegram_id", telegram_id).execute()
    if not result.data:
        return None

    limits = result.data[0]

    # Автосброс: если текущая неделя != week_start, обнуляем счётчики
    if auto_reset and limits.get("week_start"):
        now = datetime.now(timezone.utc)
        # Начало текущей недели (понедельник 00:00 UTC)
        current_week_start = now - timedelta(days=now.weekday(), hours=now.hour, minutes=now.minute, seconds=now.second)
        current_week_start = current_week_start.replace(microsecond=0)

        week_start = datetime.fromisoformat(limits["week_start"].replace("Z", "+00:00"))
        if week_start < current_week_start:
            # Новая неделя — сбрасываем только счётчики использования
            # Лимиты НЕ трогаем — купленные бонусы (Impulse) сохраняются
            update = {
                "horoscope_used": 0,
                "tarot_used": 0,
                "week_start": current_week_start.isoformat(),
            }
            # Проверяем, не истёк ли premium
            if limits.get("premium_until"):
                premium_until = datetime.fromisoformat(limits["premium_until"].replace("Z", "+00:00"))
                if premium_until < now:
                    update["is_premium"] = False
                    update["premium_until"] = None

            supabase.table("user_limits").update(update).eq("telegram_id", telegram_id).execute()
            result = supabase.table("user_limits").select("*").eq("telegram_id", telegram_id).execute()
            limits = result.data[0]

    # Проверяем истечение premium (даже если неделя не сменилась)
    if limits.get("is_premium") and limits.get("premium_until"):
        now = datetime.now(timezone.utc)
        premium_until = datetime.fromisoformat(limits["premium_until"].replace("Z", "+00:00"))
        if premium_until < now:
            supabase.table("user_limits").update({
                "is_premium": False,
                "premium_until": None,
            }).eq("telegram_id", telegram_id).execute()
            limits["is_premium"] = False
            limits["premium_until"] = None

    return limits


def create_user_limits(telegram_id: int):
    """Создать запись лимитов для нового пользователя"""
    data = {
        "telegram_id": telegram_id,
        "horoscope_used": 0,
        "tarot_used": 0,
        "horoscope_limit": 2,
        "tarot_limit": 3,
        "is_premium": False
    }
    result = supabase.table("user_limits").insert(data).execute()
    return result.data[0]


def increment_usage(telegram_id: int, usage_type: str):
    """Увеличить счётчик использования (horoscope или tarot)"""
    limits = get_user_limits(telegram_id)
    if not limits:
        limits = create_user_limits(telegram_id)

    field = f"{usage_type}_used"
    new_value = limits[field] + 1
    result = supabase.table("user_limits").update({field: new_value}).eq("telegram_id", telegram_id).execute()
    return result.data[0]


def reset_all_limits():
    """Сброс лимитов для всех пользователей (вызывается по понедельникам)"""
    now = datetime.now(timezone.utc)
    current_week_start = now - timedelta(days=now.weekday(), hours=now.hour, minutes=now.minute, seconds=now.second)
    current_week_start = current_week_start.replace(microsecond=0)
    supabase.table("user_limits").update({
        "horoscope_used": 0,
        "tarot_used": 0,
        "week_start": current_week_start.isoformat(),
    }).neq("telegram_id", 0).execute()


# === История запросов ===

def save_reading(telegram_id: int, reading_type: str, question: str, response: str, cards: list = None):
    """Сохранить результат чтения (прогноз или расклад)"""
    data = {
        "telegram_id": telegram_id,
        "reading_type": reading_type,
        "question": question,
        "response": response,
        "cards": cards
    }
    result = supabase.table("readings").insert(data).execute()
    return result.data[0]


def get_readings(telegram_id: int, limit: int = 5):
    """Получить последние N записей из истории"""
    result = (
        supabase.table("readings")
        .select("id, reading_type, question, response, cards, created_at")
        .eq("telegram_id", telegram_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


# === Рефералы ===

def add_referral_bonus(telegram_id: int):
    """Добавить +1 прогноз за приглашённого друга"""
    limits = get_user_limits(telegram_id)
    if not limits:
        limits = create_user_limits(telegram_id)
    new_limit = limits["horoscope_limit"] + 1
    result = (
        supabase.table("user_limits")
        .update({"horoscope_limit": new_limit})
        .eq("telegram_id", telegram_id)
        .execute()
    )
    return result.data[0]


def set_referrer(telegram_id: int, referrer_id: int):
    """Записать кто пригласил пользователя"""
    supabase.table("users").update({"referrer_id": referrer_id}).eq("telegram_id", telegram_id).execute()


def get_all_user_ids():
    """Получить список telegram_id всех пользователей"""
    result = supabase.table("users").select("telegram_id").execute()
    return [row["telegram_id"] for row in result.data]


def get_all_limits():
    """Получить лимиты всех пользователей"""
    result = supabase.table("user_limits").select("*").execute()
    return result.data


def get_payments_count():
    """Получить количество платежей"""
    result = supabase.table("payments").select("id", count="exact").execute()
    return result.count


# === Платежи ===

def save_payment(telegram_id: int, pack_type: str, stars_amount: int, telegram_charge_id: str):
    """Сохранить запись о платеже"""
    data = {
        "telegram_id": telegram_id,
        "pack_type": pack_type,
        "stars_amount": stars_amount,
        "telegram_charge_id": telegram_charge_id,
    }
    result = supabase.table("payments").insert(data).execute()
    return result.data[0]


def apply_pack(telegram_id: int, pack_type: str):
    """Применить купленный пакет к лимитам пользователя"""
    pack = PACKS.get(pack_type)
    if not pack:
        return None

    limits = get_user_limits(telegram_id, auto_reset=False)
    if not limits:
        limits = create_user_limits(telegram_id)

    now = datetime.now(timezone.utc)
    update = {}

    if pack_type == "vip_month":
        # VIP — полный безлимит на 30 дней
        current_premium = None
        if limits.get("premium_until"):
            current_premium = datetime.fromisoformat(limits["premium_until"].replace("Z", "+00:00"))
        # Если уже есть premium — продлеваем, иначе от текущего момента
        start = max(now, current_premium) if current_premium and current_premium > now else now
        update["is_premium"] = True
        update["premium_until"] = (start + timedelta(days=30)).isoformat()

    elif pack_type == "vibe_week":
        # Вайб недели — +5 таро, безлимит прогнозов на 7 дней
        update["tarot_limit"] = limits["tarot_limit"] + pack["tarot_bonus"]
        current_premium = None
        if limits.get("premium_until"):
            current_premium = datetime.fromisoformat(limits["premium_until"].replace("Z", "+00:00"))
        start = max(now, current_premium) if current_premium and current_premium > now else now
        update["is_premium"] = True
        update["premium_until"] = (start + timedelta(days=7)).isoformat()

    elif pack_type == "impulse":
        # Импульс — +1 к каждому лимиту
        update["horoscope_limit"] = limits["horoscope_limit"] + pack["horoscope_bonus"]
        update["tarot_limit"] = limits["tarot_limit"] + pack["tarot_bonus"]

    result = (
        supabase.table("user_limits")
        .update(update)
        .eq("telegram_id", telegram_id)
        .execute()
    )
    return result.data[0]
