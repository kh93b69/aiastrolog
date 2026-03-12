// Экран просмотра записи из истории
export default function ReadingScreen({ reading, onBack }) {
  if (!reading) return null;

  const isHoroscope = reading.reading_type === 'horoscope';
  const title = isHoroscope ? 'Звёздный чек-ап' : 'Астро-Таро';
  const icon = isHoroscope ? '⭐' : '🃏';

  // Форматирование даты
  const date = new Date(reading.created_at);
  const day = date.getDate();
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const dateStr = `${day} ${months[date.getMonth()]}`;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        <button
          onClick={onBack}
          className="text-slate-400 mb-6 flex items-center gap-2"
        >
          ← Назад
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{icon}</div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-slate-400 text-sm mt-1">{dateStr}</p>
        </div>

        {/* Вопрос (для Таро) */}
        {!isHoroscope && reading.question && (
          <div className="mystic-card mb-4 !py-3">
            <p className="text-sm text-slate-400">Твой вопрос:</p>
            <p className="text-slate-200 mt-1">{reading.question}</p>
          </div>
        )}

        {/* Карты (для Таро) */}
        {reading.cards && reading.cards.length > 0 && (
          <div className="flex justify-center gap-3 mb-4">
            {reading.cards.map((card, i) => (
              <div key={i} className="mystic-card text-center flex-1 !px-2 !py-3">
                <div className="text-sm font-semibold text-purple-300">{card}</div>
              </div>
            ))}
          </div>
        )}

        {/* Текст расклада/прогноза */}
        <div className="mystic-card">
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {reading.response}
          </div>
        </div>
      </div>
    </div>
  );
}
