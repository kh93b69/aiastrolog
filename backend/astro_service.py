"""
Сервис астрологических расчётов.
Рассчитывает натальную карту и текущие транзиты планет
с помощью библиотеки kerykeion.
"""
from datetime import datetime
from kerykeion import AstrologicalSubject


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


def get_sign_ru(sign_abbr):
    """Перевести аббревиатуру знака в русское название"""
    return SIGN_NAMES_RU.get(sign_abbr, sign_abbr)


def get_planet_ru(planet_name):
    """Перевести название планеты в русское"""
    return PLANET_NAMES_RU.get(planet_name, planet_name)


def calculate_natal_chart(birth_date, birth_time, birth_place):
    """
    Рассчитать натальную карту по данным рождения.

    Возвращает словарь с позициями планет, домов, аспектами и т.д.
    """
    # Парсим дату и время
    date_parts = birth_date.split("-")
    year = int(date_parts[0])
    month = int(date_parts[1])
    day = int(date_parts[2])

    time_parts = birth_time.split(":")
    hour = int(time_parts[0])
    minute = int(time_parts[1]) if len(time_parts) > 1 else 0

    # Создаём астрологический субъект
    subject = AstrologicalSubject(
        "User",
        year, month, day,
        hour, minute,
        city=birth_place,
    )

    # Собираем позиции планет
    planets = []
    planet_keys = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]

    for key in planet_keys:
        planet = getattr(subject, key, None)
        if planet:
            sign_ru = get_sign_ru(planet["sign"])
            name_ru = get_planet_ru(planet["name"])
            planets.append({
                "name": name_ru,
                "sign": sign_ru,
                "degree": round(planet["position"], 1),
                "house": planet.get("house", ""),
                "emoji": PLANET_EMOJI.get(name_ru, ""),
                "sign_emoji": SIGN_EMOJI.get(sign_ru, ""),
            })

    # Асцендент (первый дом)
    first_house = subject.first_house
    ascendant_sign = get_sign_ru(first_house["sign"])

    # Знак Солнца
    sun_sign = get_sign_ru(subject.sun["sign"])

    # Знак Луны
    moon_sign = get_sign_ru(subject.moon["sign"])

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

    transit_subject = AstrologicalSubject(
        "Transit",
        now.year, now.month, now.day,
        now.hour, now.minute,
        city="Greenwich",
    )

    transits = []
    planet_keys = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]

    for key in planet_keys:
        planet = getattr(transit_subject, key, None)
        if planet:
            sign_ru = get_sign_ru(planet["sign"])
            name_ru = get_planet_ru(planet["name"])
            transits.append({
                "name": name_ru,
                "sign": sign_ru,
                "degree": round(planet["position"], 1),
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
        lines.append(f"  {p['name']} в {p['sign']} ({p['degree']}°{house_info})")
    return "\n".join(lines)


def format_transits_for_prompt(transits):
    """
    Форматировать текущие транзиты в текст для промпта ИИ.
    """
    lines = ["Текущие транзиты планет:"]
    for t in transits:
        lines.append(f"  {t['name']} в {t['sign']} ({t['degree']}°)")
    return "\n".join(lines)
