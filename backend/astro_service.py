"""
Сервис астрологических расчётов.
Рассчитывает натальную карту и текущие транзиты планет
с помощью библиотеки kerykeion.
"""
import requests
from datetime import datetime
from kerykeion import AstrologicalSubject


def geocode_city(city_name):
    """
    Получить координаты города через OpenStreetMap Nominatim.
    Возвращает (широта, долгота, timezone) или None.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": city_name,
        "format": "json",
        "limit": 1,
        "accept-language": "en",
    }
    headers = {"User-Agent": "AIAstrolog/1.0"}
    resp = requests.get(url, params=params, headers=headers, timeout=10)
    data = resp.json()
    if data:
        return float(data[0]["lat"]), float(data[0]["lon"])
    return None


# Названия планет на русском
PLANET_NAMES_RU = {
    "Sun": "Солнце",
    "Moon": "Луна",
    "Mercury": "Меркурий",
    "Venus": "Венера",
    "Mars": "Марс",
    "Jupiter": "Юпитер",
    "Saturn": "Сатурн",
    "Uranus": "Уран",
    "Neptune": "Нептун",
    "Pluto": "Плутон",
}

# Названия знаков на русском
SIGN_NAMES_RU = {
    "Ari": "Овен",
    "Tau": "Телец",
    "Gem": "Близнецы",
    "Can": "Рак",
    "Leo": "Лев",
    "Vir": "Дева",
    "Lib": "Весы",
    "Sco": "Скорпион",
    "Sag": "Стрелец",
    "Cap": "Козерог",
    "Aqu": "Водолей",
    "Pis": "Рыбы",
}

# Эмодзи для знаков
SIGN_EMOJI = {
    "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋",
    "Лев": "♌", "Дева": "♍", "Весы": "♎", "Скорпион": "♏",
    "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓",
}

# Эмодзи для планет
PLANET_EMOJI = {
    "Солнце": "☀️", "Луна": "🌙", "Меркурий": "☿️", "Венера": "♀️",
    "Марс": "♂️", "Юпитер": "♃", "Сатурн": "♄",
    "Уран": "⛢", "Нептун": "♆", "Плутон": "♇",
}

# Номер дома из строки вида "First_House" -> 1
HOUSE_NUMBERS = {
    "First_House": 1, "Second_House": 2, "Third_House": 3,
    "Fourth_House": 4, "Fifth_House": 5, "Sixth_House": 6,
    "Seventh_House": 7, "Eighth_House": 8, "Ninth_House": 9,
    "Tenth_House": 10, "Eleventh_House": 11, "Twelfth_House": 12,
}


def get_sign_ru(sign_abbr):
    """Перевести аббревиатуру знака в русское название"""
    return SIGN_NAMES_RU.get(sign_abbr, sign_abbr)


def get_planet_ru(planet_name):
    """Перевести название планеты в русское"""
    return PLANET_NAMES_RU.get(planet_name, planet_name)


def get_house_number(house_str):
    """Получить номер дома из строки"""
    return HOUSE_NUMBERS.get(house_str, "")


def calculate_natal_chart(birth_date, birth_time, birth_place):
    """
    Рассчитать натальную карту по данным рождения.
    Возвращает словарь с позициями планет.
    """
    # Парсим дату и время
    date_parts = birth_date.split("-")
    year = int(date_parts[0])
    month = int(date_parts[1])
    day = int(date_parts[2])

    time_parts = birth_time.split(":")
    hour = int(time_parts[0])
    minute = int(time_parts[1]) if len(time_parts) > 1 else 0

    # Получаем координаты города
    coords = geocode_city(birth_place)
    if not coords:
        raise ValueError(f"Город не найден: {birth_place}")

    lat, lng = coords

    # Создаём астрологический субъект с координатами
    subject = AstrologicalSubject(
        "User",
        year, month, day,
        hour, minute,
        lng=lng,
        lat=lat,
        city=birth_place,
    )

    # Список планет для извлечения
    planet_attrs = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]

    # Собираем позиции планет
    planets = []
    for attr_name in planet_attrs:
        planet = getattr(subject, attr_name, None)
        if planet is None:
            continue

        sign_ru = get_sign_ru(planet.sign)
        name_ru = get_planet_ru(planet.name)
        house_num = get_house_number(getattr(planet, "house", ""))

        planets.append({
            "name": name_ru,
            "sign": sign_ru,
            "degree": round(planet.position, 1),
            "house": house_num,
            "emoji": PLANET_EMOJI.get(name_ru, ""),
            "sign_emoji": SIGN_EMOJI.get(sign_ru, ""),
            "retrograde": getattr(planet, "retrograde", False),
        })

    # Асцендент (первый дом)
    ascendant_sign = get_sign_ru(subject.first_house.sign)

    # Знак Солнца и Луны
    sun_sign = get_sign_ru(subject.sun.sign)
    moon_sign = get_sign_ru(subject.moon.sign)

    return {
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "ascendant": ascendant_sign,
        "sun_sign_emoji": SIGN_EMOJI.get(sun_sign, ""),
        "moon_sign_emoji": SIGN_EMOJI.get(moon_sign, ""),
        "ascendant_emoji": SIGN_EMOJI.get(ascendant_sign, ""),
        "planets": planets,
    }


def get_current_transits():
    """
    Получить текущие позиции планет (транзиты на сегодня).
    """
    now = datetime.now()

    # Гринвич — фиксированные координаты
    transit_subject = AstrologicalSubject(
        "Transit",
        now.year, now.month, now.day,
        now.hour, now.minute,
        lng=0.0,
        lat=51.4769,
        city="Greenwich",
    )

    planet_attrs = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]

    transits = []
    for attr_name in planet_attrs:
        planet = getattr(transit_subject, attr_name, None)
        if planet is None:
            continue

        sign_ru = get_sign_ru(planet.sign)
        name_ru = get_planet_ru(planet.name)
        transits.append({
            "name": name_ru,
            "sign": sign_ru,
            "degree": round(planet.position, 1),
            "retrograde": getattr(planet, "retrograde", False),
        })

    return transits


def format_natal_for_prompt(natal_data):
    """
    Форматировать натальную карту в текст для промпта ИИ.
    """
    lines = []
    lines.append(f"Солнце: {natal_data['sun_sign']}")
    lines.append(f"Луна: {natal_data['moon_sign']}")
    lines.append(f"Асцендент: {natal_data['ascendant']}")
    lines.append("")
    lines.append("Позиции планет в натале:")
    for p in natal_data["planets"]:
        house_info = f", {p['house']}-й дом" if p["house"] else ""
        retro = " (ретро)" if p.get("retrograde") else ""
        lines.append(f"  {p['name']} в {p['sign']} ({p['degree']}°{house_info}){retro}")
    return "\n".join(lines)


def format_transits_for_prompt(transits):
    """
    Форматировать текущие транзиты в текст для промпта ИИ.
    """
    lines = ["Текущие транзиты планет:"]
    for t in transits:
        retro = " (ретро)" if t.get("retrograde") else ""
        lines.append(f"  {t['name']} в {t['sign']} ({t['degree']}°){retro}")
    return "\n".join(lines)
