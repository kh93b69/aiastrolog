import { useState, useEffect } from 'react';
import { getReadings } from '../api';

export default function Dashboard({ limits, telegramId, onHoroscope, onTarot, onNatalChart, onViewReading, onInvite, onOpenPacks }) {
  const horoscopeLeft = limits ? limits.horoscope_limit - limits.horoscope_used : 0;
  const tarotLeft = limits ? limits.tarot_limit - limits.tarot_used : 0;
  const isPremium = limits?.is_premium;
  const premiumUntil = limits?.premium_until;
  const [readings, setReadings] = useState([]);

  // Загружаем историю раскладов
  useEffect(() => {
    if (telegramId) {
      getReadings(telegramId)
        .then(res => setReadings(res.data.readings || []))
        .catch(() => {});
    }
  }, [telegramId]);

  // Форматирование даты
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${day} ${months[date.getMonth()]}`;
  }

  // Мало ли осталось (для показа плашки энергии)
  const energyLow = !isPremium && (horoscopeLeft <= 0 || tarotLeft <= 0);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Новелла
          </h1>
          {isPremium && (
            <div className="mt-1">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                👑 VIP
              </span>
              {premiumUntil && (
                <div className="text-[10px] text-slate-500 mt-1">
                  до {formatDate(premiumUntil)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Плашка «Энергия на исходе» */}
        {energyLow && (
          <div
            className="mb-6 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform
              bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/30"
            onClick={onOpenPacks}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-pulse">🌙</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-purple-300">
                  Твоя энергия на исходе
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Пополни запасы, чтобы продолжить общение с Новеллой
                </div>
              </div>
              <div className="text-purple-400 text-sm">→</div>
            </div>
          </div>
        )}

        {/* Счётчик лимитов */}
        <div className="mystic-card mb-6">
          <p className="text-sm text-slate-400 mb-3">
            {isPremium ? 'Безлимитный доступ активен ✨' : 'Осталось на этой неделе:'}
          </p>
          {!isPremium && (
            <div className="flex justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {horoscopeLeft}/{limits?.horoscope_limit || 2}
                </div>
                <div className="text-xs text-slate-500">Прогнозов</div>
              </div>
              <div className="w-px bg-purple-500/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {tarotLeft}/{limits?.tarot_limit || 3}
                </div>
                <div className="text-xs text-slate-500">Раскладов</div>
              </div>
            </div>
          )}
        </div>

        {/* Натальная карта */}
        <div
          className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={onNatalChart}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌌</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Натальная карта</h3>
              <p className="text-sm text-slate-400">
                Твоя карта звёзд и планет
              </p>
            </div>
          </div>
        </div>

        {/* Карточка прогноза */}
        <div
          className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={(isPremium || horoscopeLeft > 0) ? onHoroscope : onOpenPacks}
          style={{ opacity: (isPremium || horoscopeLeft > 0) ? 1 : 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="font-semibold text-lg">Звёздный чек-ап</h3>
              <p className="text-sm text-slate-400">
                Прогноз на день по транзитам
              </p>
            </div>
          </div>
          {!isPremium && horoscopeLeft <= 0 && (
            <div className="mt-3 w-full py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium text-center">
              Стать ближе к звездам ⭐
            </div>
          )}
        </div>

        {/* Карточка Таро */}
        <div
          className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={(isPremium || tarotLeft > 0) ? onTarot : onOpenPacks}
          style={{ opacity: (isPremium || tarotLeft > 0) ? 1 : 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🃏</div>
            <div>
              <h3 className="font-semibold text-lg">Астро-Таро</h3>
              <p className="text-sm text-slate-400">
                Расклад карт с привязкой к натальной карте
              </p>
            </div>
          </div>
          {!isPremium && tarotLeft <= 0 && (
            <div className="mt-3 w-full py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium text-center">
              Открыть портал инсайтов ⭐
            </div>
          )}
        </div>

        {/* Кнопка пригласить */}
        <div
          className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={onInvite}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎁</div>
            <div>
              <h3 className="font-semibold text-lg">Пригласить подругу</h3>
              <p className="text-sm text-slate-400">
                Получи +1 прогноз за каждого друга
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка покупки */}
        <div
          className="mystic-card mb-6 cursor-pointer active:scale-[0.98] transition-transform
            border-purple-500/40 bg-gradient-to-r from-[#1a1a2e] to-[#1e1538]"
          onClick={onOpenPacks}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-400 to-amber-300 bg-clip-text text-transparent">
                Наполнить энергией
              </h3>
              <p className="text-sm text-slate-400">
                Пакеты прогнозов и раскладов
              </p>
            </div>
            <div className="text-slate-500 text-sm">→</div>
          </div>
        </div>

        {/* История раскладов */}
        {readings.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm text-slate-400 mb-3 px-1">Недавние расклады</h3>
            <div className="space-y-2">
              {readings.map((r) => (
                <div
                  key={r.id}
                  className="mystic-card !py-3 !px-4 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => onViewReading && onViewReading(r)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {r.reading_type === 'horoscope' ? '⭐' : '🃏'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.reading_type === 'horoscope' ? 'Звёздный чек-ап' : r.question}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(r.created_at)}
                        {r.cards && ` · ${r.cards.join(', ')}`}
                      </div>
                    </div>
                    <div className="text-slate-500 text-sm">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
