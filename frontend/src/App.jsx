import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import OnboardingScreen from './components/OnboardingScreen';
import NatalChartScreen from './components/NatalChartScreen';
import Dashboard from './components/Dashboard';
import HoroscopeScreen from './components/HoroscopeScreen';
import TarotScreen from './components/TarotScreen';
import ReadingScreen from './components/ReadingScreen';
import { registerUser, updateProfile, getUser, getNatalChart, getHoroscope, getTarotReading, processReferral } from './api';

// Получаем telegram_id из Telegram WebApp или используем тестовый
function getTelegramUser() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    return { id: tgUser.id, username: tgUser.username };
  }
  // Тестовый режим (для разработки без Telegram)
  return { id: 123456789, username: 'test_user' };
}

// Получить start_param из Telegram (для реферальных ссылок)
function getStartParam() {
  return window.Telegram?.WebApp?.initDataUnsafe?.start_param || null;
}

function App() {
  // Экраны: welcome, onboarding, natal_chart, dashboard, horoscope, tarot, reading
  const [screen, setScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Данные для экранов
  const [horoscope, setHoroscope] = useState(null);
  const [tarotCards, setTarotCards] = useState(null);
  const [tarotReading, setTarotReading] = useState(null);
  const [natalChart, setNatalChart] = useState(null);
  const [natalReading, setNatalReading] = useState(null);
  const [viewedReading, setViewedReading] = useState(null);

  const tgUser = getTelegramUser();

  // Настраиваем Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Начать путь — регистрация + обработка реферала
  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(tgUser.id, tgUser.username);
      setUser(res.data.user);
      setLimits(res.data.limits);

      // Обработка реферальной ссылки (start_param = id пригласившего)
      const startParam = getStartParam();
      if (startParam && !res.data.user.onboarding_done) {
        try {
          await processReferral(tgUser.id, parseInt(startParam));
        } catch (e) {
          // Реферал не критичен
        }
      }

      if (res.data.user.onboarding_done) {
        setScreen('dashboard');
      } else {
        setScreen('onboarding');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
    setLoading(false);
  }

  // Сохранение профиля — после онбординга показываем натальную карту
  async function handleOnboarding(birthDate, birthTime, birthPlace) {
    setLoading(true);
    setError(null);
    try {
      const res = await updateProfile(tgUser.id, birthDate, birthTime, birthPlace);
      setUser(res.data.user);
      setScreen('natal_chart');
    } catch (err) {
      setError('Ошибка сохранения профиля');
      setScreen('dashboard');
      setLoading(false);
      return;
    }

    // Рассчитываем натальную карту отдельно
    try {
      const natalRes = await getNatalChart(tgUser.id);
      setNatalChart(natalRes.data.natal_chart);
      setNatalReading(natalRes.data.reading);
    } catch (err) {
      console.error('Ошибка расчёта натальной карты:', err);
    }
    setLoading(false);
  }

  // Открыть натальную карту с дашборда
  async function handleNatalChart() {
    setScreen('natal_chart');
    setNatalChart(null);
    setNatalReading(null);
    setLoading(true);
    setError(null);
    try {
      const natalRes = await getNatalChart(tgUser.id);
      setNatalChart(natalRes.data.natal_chart);
      setNatalReading(natalRes.data.reading);
    } catch (err) {
      console.error('Ошибка расчёта натальной карты:', err);
    }
    setLoading(false);
  }

  // Получить прогноз
  async function handleHoroscope() {
    setScreen('horoscope');
    setHoroscope(null);
    setLoading(true);
    setError(null);
    try {
      const res = await getHoroscope(tgUser.id);
      setHoroscope(res.data.horoscope);
      setLimits(res.data.limits);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Лимит прогнозов исчерпан на этой неделе');
      } else {
        setError('Ошибка получения прогноза');
      }
      setScreen('dashboard');
    }
    setLoading(false);
  }

  // Открыть экран Таро
  async function handleTarot() {
    setScreen('tarot');
    setTarotCards(null);
    setTarotReading(null);
  }

  // Отправить вопрос Таро с типом расклада
  async function handleTarotSubmit(question, spreadType, category) {
    setLoading(true);
    setError(null);
    try {
      const res = await getTarotReading(tgUser.id, question, spreadType, category);
      setTarotCards(res.data.cards);
      setTarotReading(res.data.reading);
      setLimits(res.data.limits);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Лимит раскладов исчерпан на этой неделе');
      } else {
        setError('Ошибка получения расклада');
      }
      setScreen('dashboard');
    }
    setLoading(false);
  }

  // Посмотреть запись из истории
  function handleViewReading(reading) {
    setViewedReading(reading);
    setScreen('reading');
  }

  // Поделиться натальной картой
  function handleShareNatal() {
    if (!natalChart) return;
    const text = `🔮 Моя натальная карта в Новелле:\n\n` +
      `☀️ Солнце: ${natalChart.sun_sign}\n` +
      `🌙 Луна: ${natalChart.moon_sign}\n` +
      `⬆️ Асцендент: ${natalChart.ascendant}\n\n` +
      `Узнай свою карту звёзд!`;

    if (window.Telegram?.WebApp) {
      // Отправить через Telegram
      window.Telegram.WebApp.switchInlineQuery(text, ['users', 'groups', 'channels']);
    }
  }

  // Пригласить друга — реферальная ссылка
  function handleInvite() {
    const botUsername = 'NovellaAstroBot'; // имя бота
    const refLink = `https://t.me/${botUsername}?startapp=${tgUser.id}`;
    const text = `🔮 Я пользуюсь Новеллой — персональный астролог прямо в Телеграме!\n\nУзнай свою натальную карту, получи прогноз на день и расклад Таро ✨\n\n`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      // Шарим через Telegram
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`
      );
    }
  }

  // Назад к дашборду
  function goBack() {
    setScreen('dashboard');
    setHoroscope(null);
    setTarotCards(null);
    setTarotReading(null);
    setViewedReading(null);
  }

  return (
    <div>
      {/* Ошибка */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-center text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-400">✕</button>
        </div>
      )}

      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}

      {screen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboarding} loading={loading} />
      )}

      {screen === 'natal_chart' && (
        <NatalChartScreen
          natalChart={natalChart}
          reading={natalReading}
          loading={loading}
          onContinue={() => setScreen('dashboard')}
          onShare={handleShareNatal}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          limits={limits}
          telegramId={tgUser.id}
          onHoroscope={handleHoroscope}
          onTarot={handleTarot}
          onNatalChart={handleNatalChart}
          onViewReading={handleViewReading}
          onInvite={handleInvite}
        />
      )}

      {screen === 'horoscope' && (
        <HoroscopeScreen
          horoscope={horoscope}
          loading={loading}
          onBack={goBack}
        />
      )}

      {screen === 'tarot' && (
        <TarotScreen
          onSubmit={handleTarotSubmit}
          reading={tarotReading}
          cards={tarotCards}
          loading={loading}
          onBack={goBack}
        />
      )}

      {screen === 'reading' && (
        <ReadingScreen
          reading={viewedReading}
          onBack={goBack}
        />
      )}
    </div>
  );
}

export default App;
