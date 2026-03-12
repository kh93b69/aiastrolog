export default function HoroscopeScreen({ horoscope, loading, onBack }) {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        {/* Кнопка назад */}
        <button
          onClick={onBack}
          className="text-slate-400 mb-6 flex items-center gap-2"
        >
          ← Назад
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⭐</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
            Звёздный чек-ап
          </h2>
          <p className="text-slate-400 text-sm mt-1">Твой прогноз на сегодня</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner" />
            <p className="text-slate-400 mt-4">Сверяю транзиты с твоей картой...</p>
          </div>
        ) : horoscope ? (
          <div className="mystic-card">
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {horoscope}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-6">Не удалось загрузить прогноз. Попробуй позже.</p>
            <button onClick={onBack} className="mystic-btn">
              ← Вернуться
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
