from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


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

def get_user_limits(telegram_id: int):
    """Получить текущие лимиты пользователя"""
    result = supabase.table("user_limits").select("*").eq("telegram_id", telegram_id).execute()
    if result.data:
        return result.data[0]
    return None


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
    supabase.table("user_limits").update({"horoscope_used": 0, "tarot_used": 0}).neq("telegram_id", 0).execute()


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
