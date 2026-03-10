export default function Dashboard({ limits, onHoroscope, onTarot }) {
  const horoscopeLeft = limits ? limits.horoscope_limit - limits.horoscope_used : 0;
  const tarotLeft = limits ? limits.tarot_limit - limits.tarot_used : 0;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            AI Astrolog
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

        {/* Карточка прогноза */}
        <div
          className="mystic-card mb-4 cursor-pointer"
          onClick={horoscopeLeft > 0 ? onHoroscope : undefined}
          style={{ opacity: horoscopeLeft > 0 ? 1 : 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="font-semibold text-lg">Прогноз на день</h3>
              <p className="text-sm text-slate-400">
                Персональный астрологический прогноз
              </p>
            </div>
          </div>
          {horoscopeLeft <= 0 && (
            <button className="mt-4 w-full py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium">
              Улучшить тариф
            </button>
          )}
        </div>

        {/* Карточка Таро */}
        <div
          className="mystic-card cursor-pointer"
          onClick={tarotLeft > 0 ? onTarot : undefined}
          style={{ opacity: tarotLeft > 0 ? 1 : 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🃏</div>
            <div>
              <h3 className="font-semibold text-lg">Расклад Таро</h3>
              <p className="text-sm text-slate-400">
                3 карты — Прошлое, Настоящее, Будущее
              </p>
            </div>
          </div>
          {tarotLeft <= 0 && (
            <button className="mt-4 w-full py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium">
              Улучшить тариф
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
