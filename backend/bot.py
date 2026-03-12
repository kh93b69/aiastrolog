import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from config import TELEGRAM_BOT_TOKEN, WEBAPP_URL

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


async def main():
    print("Бот запущен!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
