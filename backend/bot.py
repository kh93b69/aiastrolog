import asyncio
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


async def main():
    print("Бот запущен!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
