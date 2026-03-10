# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Инструкции

- Всегда отвечать на русском языке
- Писать комментарии в коде на русском
- Объяснять ошибки и предложения на русском
- Используй Sequential Thinking для сложных размышлений
- Никогда не используй наследование, присваивание классу внешних функций, рефлексию и другие сложные техники. Код должен быь понятен Junior разработчику с минимальным опытом
- Используй Context7 для досткупа к документации всех библиотек
- Для реализации любых фич с использованием интеграций с внешним api/библиотеками изучай документации с помощью Context7 инструментов
- Если есть изменения на фронтенде, то проверь что фронт работает, открыв его через Playwright


## Project

AI Astrolog — Telegram Mini App для ИИ-прогнозов по астрологии и раскладов Таро. Монетизация через систему лимитов и Telegram Stars.

## Build & Run

### Backend (FastAPI + aiogram)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # заполнить ключи
python run.py          # запуск API + Telegram бот
```

### Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev            # dev-сервер на :5173
npm run build          # продакшн сборка
```

### База данных
Выполнить `backend/schema.sql` в Supabase SQL Editor для создания таблиц.

## Architecture

```
backend/
  main.py         — FastAPI приложение, все API эндпоинты
  bot.py          — Telegram бот на aiogram (кнопка открытия TMA)
  run.py          — запуск API + бота одновременно
  database.py     — работа с Supabase (users, limits, readings)
  ai_service.py   — OpenAI GPT-4o: генерация прогнозов и раскладов Таро
  config.py       — переменные окружения
  schema.sql      — SQL-схема таблиц для Supabase

frontend/src/
  App.jsx         — роутинг между экранами, состояние приложения
  api.js          — axios-клиент для общения с backend
  components/
    WelcomeScreen.jsx    — экран приветствия
    OnboardingScreen.jsx — сбор данных рождения
    Dashboard.jsx        — главный дашборд с лимитами
    HoroscopeScreen.jsx  — отображение прогноза
    TarotScreen.jsx      — ввод вопроса + отображение расклада
```

### API эндпоинты
- `POST /api/user/register` — регистрация / возврат пользователя
- `POST /api/user/profile` — сохранение данных рождения (онбординг)
- `GET /api/user/{telegram_id}` — получить профиль + лимиты
- `POST /api/horoscope` — генерация прогноза (лимит: 2/нед)
- `POST /api/tarot` — расклад Таро (лимит: 3/нед)
- `POST /api/limits/reset` — сброс лимитов (cron по понедельникам)
