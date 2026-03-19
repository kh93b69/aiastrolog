"""Запуск FastAPI сервера и Telegram бота одновременно"""
import os
import asyncio
import uvicorn
from bot import bot, dp, daily_scheduler


async def start_bot():
    """Запуск бота"""
    print("Telegram бот запущен!")
    await dp.start_polling(bot)


async def start_api():
    """Запуск API сервера"""
    port = int(os.getenv("PORT", 8000))
    config = uvicorn.Config("main:app", host="0.0.0.0", port=port)
    server = uvicorn.Server(config)
    print(f"API сервер запущен на порту {port}")
    await server.serve()


async def main():
    await asyncio.gather(start_bot(), start_api(), daily_scheduler())


if __name__ == "__main__":
    asyncio.run(main())
