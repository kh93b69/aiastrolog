import asyncio
import random
from datetime import datetime, timezone
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart
from aiogram.types import (
    WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton,
    LabeledPrice, PreCheckoutQuery,
)
from config import TELEGRAM_BOT_TOKEN, WEBAPP_URL, ADMIN_TELEGRAM_ID
import database as db

bot = Bot(token=TELEGRAM_BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    """Приветствие и кнопка открытия Mini App"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="✨ Открыть Новеллу",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])

    await message.answer(
        "🔮 *Добро пожаловать в Новеллу!*\n\n"
        "Персональные астрологические прогнозы и расклады Таро "
        "от твоего звёздного астролога ✨\n\n"
        "Нажми кнопку ниже, чтобы начать свой путь:",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


# === Обработка платежей через Telegram Stars ===

@dp.pre_checkout_query()
async def process_pre_checkout(pre_checkout_query: PreCheckoutQuery):
    """Подтверждаем готовность принять платёж (ответить нужно за 10 сек)"""
    await pre_checkout_query.answer(ok=True)


@dp.message(F.successful_payment)
async def process_successful_payment(message: types.Message):
    """Обработка успешного платежа — начисляем бонусы"""
    payment = message.successful_payment
    payload = payment.invoice_payload  # формат: "pack_type:telegram_id"

    try:
        pack_type, telegram_id_str = payload.split(":")
        telegram_id = int(telegram_id_str)
    except (ValueError, AttributeError):
        await message.answer("Ошибка обработки платежа. Напиши в поддержку.")
        return

    pack = db.PACKS.get(pack_type)
    if not pack:
        await message.answer("Неизвестный пакет. Напиши в поддержку.")
        return

    # Сохраняем платёж
    db.save_payment(
        telegram_id=telegram_id,
        pack_type=pack_type,
        stars_amount=payment.total_amount,
        telegram_charge_id=payment.telegram_payment_charge_id,
    )

    # Применяем пакет
    new_limits = db.apply_pack(telegram_id, pack_type)

    # Красивое сообщение
    pack_names = {
        "impulse": "✨ Мистический импульс активирован!",
        "vibe_week": "🌊 Вайб недели подключён! 7 дней без ограничений.",
        "vip_month": "👑 Подружка Новеллы! 30 дней безлимита.",
    }
    msg = pack_names.get(pack_type, "Пакет активирован!")
    await message.answer(f"{msg}\n\nОткрой Новеллу, чтобы продолжить 🔮")

    # Уведомление админу о покупке
    if ADMIN_TELEGRAM_ID:
        try:
            username = message.from_user.username or "без юзернейма"
            admin_msg = (
                f"💰 Новая покупка!\n\n"
                f"Пользователь: @{username} (ID: {telegram_id})\n"
                f"Пакет: {pack['title']}\n"
                f"Сумма: {payment.total_amount} ⭐"
            )
            await bot.send_message(int(ADMIN_TELEGRAM_ID), admin_msg)
        except Exception:
            pass  # Уведомление не критично


async def create_invoice_link(pack_type: str, telegram_id: int) -> str:
    """Создать ссылку на инвойс для оплаты в Mini App"""
    pack = db.PACKS.get(pack_type)
    if not pack:
        return None

    link = await bot.create_invoice_link(
        title=pack["title"],
        description=pack["description"],
        payload=f"{pack_type}:{telegram_id}",
        currency="XTR",
        prices=[LabeledPrice(label="Stars", amount=pack["stars"])],
        provider_token="",
    )
    return link


# === Ежедневные уведомления ===

# Тексты ежедневных напоминаний (выбираются случайно)
DAILY_MESSAGES = [
    "🔮 Звёзды выстроились! Новелла чувствует важные перемены вокруг тебя. Загляни ✨",
    "🌙 Сегодня особенный день... Карты хотят рассказать тебе кое-что важное.",
    "✨ Новелла уловила вибрации перемен. Узнай, что ждёт тебя сегодня!",
    "🃏 Карты шепчут о важном событии в ближайшие дни. Хочешь узнать?",
    "🌟 Твои звёзды сегодня особенно активны. Не пропусти послание!",
    "🔮 Новелла видит интересный расклад на сегодня. Загляни, пока энергия не ушла.",
    "💫 Вселенная подготовила для тебя послание. Открой Новеллу!",
    "🌙 Ночные звёзды оставили знак... Новелла готова рассказать, что он значит.",
    "✨ У Новеллы есть предчувствие насчёт твоего дня. Узнай подробности!",
    "🃏 Таро нашептало кое-что любопытное. Загляни к Новелле!",
]

# Тексты для уведомления об исчерпании лимитов
LIMITS_EXHAUSTED_MESSAGES = [
    "✨ Твоя энергия на этой неделе иссякла... Но я чувствую, что впереди важные события. Наполни энергию, чтобы узнать больше 🌙",
    "🔮 Лимиты закончились, но звёзды не перестают говорить. Пополни запасы энергии — у меня есть для тебя важное послание!",
    "🌟 Неделя была насыщенной! Я буду ждать тебя... Или открой новый портал инсайтов прямо сейчас ✨",
]


async def send_daily_notifications():
    """Отправить ежедневное напоминание всем пользователям"""
    user_ids = db.get_all_user_ids()
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="✨ Открыть Новеллу",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])

    sent = 0
    blocked = 0
    for user_id in user_ids:
        # Не отправляем админу (он и так в курсе)
        if ADMIN_TELEGRAM_ID and user_id == int(ADMIN_TELEGRAM_ID):
            continue
        try:
            msg = random.choice(DAILY_MESSAGES)
            await bot.send_message(user_id, msg, reply_markup=keyboard)
            sent += 1
            # Пауза между сообщениями (Telegram лимит ~30 msg/sec)
            await asyncio.sleep(0.05)
        except Exception:
            blocked += 1  # Пользователь заблокировал бота

    # Отчёт админу
    if ADMIN_TELEGRAM_ID:
        try:
            await bot.send_message(
                int(ADMIN_TELEGRAM_ID),
                f"📬 Ежедневная рассылка завершена\n\n"
                f"Отправлено: {sent}\n"
                f"Заблокировали бота: {blocked}"
            )
        except Exception:
            pass


async def send_limits_exhausted(telegram_id: int):
    """Уведомить пользователя что лимиты закончились"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="✨ Наполнить энергией",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    try:
        msg = random.choice(LIMITS_EXHAUSTED_MESSAGES)
        await bot.send_message(telegram_id, msg, reply_markup=keyboard)
    except Exception:
        pass  # Пользователь заблокировал бота


async def daily_scheduler():
    """Планировщик: отправляет рассылку каждый день в 10:00 UTC (13:00 МСК)"""
    from datetime import timedelta
    while True:
        now = datetime.now(timezone.utc)
        # Следующий запуск — сегодня в 10:00 UTC (или завтра, если уже прошло)
        target = now.replace(hour=10, minute=0, second=0, microsecond=0)
        if now >= target:
            target = target + timedelta(days=1)

        wait_seconds = (target - now).total_seconds()
        print(f"📬 Следующая рассылка через {int(wait_seconds // 3600)}ч {int((wait_seconds % 3600) // 60)}мин")
        await asyncio.sleep(wait_seconds)

        # Отправляем рассылку
        await send_daily_notifications()


async def main():
    print("Бот запущен!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
