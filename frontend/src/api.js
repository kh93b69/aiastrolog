import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
});

// Регистрация / получение пользователя
export function registerUser(telegramId, username) {
  return api.post('/api/user/register', {
    telegram_id: telegramId,
    username: username,
  });
}

// Обновление профиля (онбординг)
export function updateProfile(telegramId, birthDate, birthTime, birthPlace) {
  return api.post('/api/user/profile', {
    telegram_id: telegramId,
    birth_date: birthDate,
    birth_time: birthTime,
    birth_place: birthPlace,
  });
}

// Получить данные пользователя
export function getUser(telegramId) {
  return api.get(`/api/user/${telegramId}`);
}

// Получить прогноз
export function getHoroscope(telegramId) {
  return api.post('/api/horoscope', {
    telegram_id: telegramId,
  });
}

// Получить расклад Таро
export function getTarotReading(telegramId, question) {
  return api.post('/api/tarot', {
    telegram_id: telegramId,
    question: question,
  });
}
