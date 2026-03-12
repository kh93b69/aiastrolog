import { useState, useEffect } from 'react';
import { getReadings } from '../api';

export default function Dashboard({ limits, telegramId, onHoroscope, onTarot, onNatalChart, onViewReading, onInvite }) {
  const horoscopeLeft = limits ? limits.horoscope_limit - limits.horoscope_used : 0;
  const tarotLeft = limits ? limits.tarot_limit - limits.tarot_used : 0;
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

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Новелла
          </h1>
        </div>

        {/* Счётчик лимитов */}
        <div className="mystic-card mb-6">
          <p className="text-sm text-slate-400 mb-3">Осталось на этой неделе:</p>
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
          onClick={horoscopeLeft > 0 ? onHoroscope : undefined}
          style={{ opacity: horoscopeLeft > 0 ? 1 : 0.5 }}
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
          {horoscopeLeft <= 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onInvite && onInvite(); }}
              className="mt-3 w-full py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium"
            >
              🎁 Пригласи подругу = +1 прогноз
            </button>
          )}
        </div>

        {/* Карточка Таро */}
        <div
          className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={tarotLeft > 0 ? onTarot : undefined}
          style={{ opacity: tarotLeft > 0 ? 1 : 0.5 }}
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
          {tarotLeft <= 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onInvite && onInvite(); }}
              className="mt-3 w-full py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium"
            >
              🎁 Пригласи подругу = +1 расклад
            </button>
          )}
        </div>

        {/* Кнопка пригласить */}
        <div
          className="mystic-card mb-6 cursor-pointer active:scale-[0.98] transition-transform"
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
