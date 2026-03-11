export default function NatalChartScreen({ natalChart, reading, loading, onContinue }) {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌌</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Твоя натальная карта
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner" />
            <p className="text-slate-400 mt-4">Рассчитываю карту звёзд...</p>
          </div>
        ) : natalChart ? (
          <div>
            {/* Большая тройка */}
            <div className="flex justify-center gap-3 mb-6">
              <div className="mystic-card text-center flex-1 px-2 py-4">
                <div className="text-3xl mb-1">{natalChart.sun_sign_emoji}</div>
                <div className="text-xs text-slate-400">Солнце</div>
                <div className="text-sm font-semibold text-amber-300">{natalChart.sun_sign}</div>
              </div>
              <div className="mystic-card text-center flex-1 px-2 py-4">
                <div className="text-3xl mb-1">{natalChart.moon_sign_emoji}</div>
                <div className="text-xs text-slate-400">Луна</div>
                <div className="text-sm font-semibold text-blue-300">{natalChart.moon_sign}</div>
              </div>
              <div className="mystic-card text-center flex-1 px-2 py-4">
                <div className="text-3xl mb-1">{natalChart.ascendant_emoji}</div>
                <div className="text-xs text-slate-400">Асцендент</div>
                <div className="text-sm font-semibold text-purple-300">{natalChart.ascendant}</div>
              </div>
            </div>

            {/* Позиции планет */}
            <div className="mystic-card mb-6">
              <h3 className="text-sm text-slate-400 mb-3">Планеты в твоей карте</h3>
              <div className="space-y-2">
                {natalChart.planets.map((planet, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {planet.emoji} {planet.name}
                    </span>
                    <span className="text-purple-300">
                      {planet.sign_emoji} {planet.sign} {planet.degree}°
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Интерпретация от ИИ */}
            {reading && (
              <div className="mystic-card mb-6">
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {reading}
                </div>
              </div>
            )}

            {/* Кнопка продолжить */}
            <button onClick={onContinue} className="mystic-btn">
              Перейти к прогнозам →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
