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
          <h2 className="text-2xl font-bold">Ваш прогноз на день</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner" />
            <p className="text-slate-400 mt-4">Читаю звёзды...</p>
          </div>
        ) : horoscope ? (
          <div className="mystic-card">
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {horoscope}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
