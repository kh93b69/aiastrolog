"""Запуск FastAPI сервера и Telegram бота одновременно"""
import asyncio
import uvicorn
from bot import bot, dp


async def start_bot():
    """Запуск бота"""
    print("Telegram бот запущен!")
    await dp.start_polling(bot)


async def start_api():
    """Запуск API сервера"""
    config = uvicorn.Config("main:app", host="0.0.0.0", port=8000, reload=True)
    server = uvicorn.Server(config)
    print("API сервер запущен на http://localhost:8000")
    await server.serve()


async def main():
    await asyncio.gather(start_bot(), start_api())


if __name__ == "__main__":
    asyncio.run(main())
