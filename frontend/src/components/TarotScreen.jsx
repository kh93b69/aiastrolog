import { useState } from 'react';

export default function TarotScreen({ onSubmit, reading, cards, loading, onBack }) {
  const [question, setQuestion] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question);
  }

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
          <div className="text-5xl mb-3">🃏</div>
          <h2 className="text-2xl font-bold">Расклад Таро</h2>
          <p className="text-slate-400 text-sm mt-2">
            Задайте вопрос — карты дадут ответ
          </p>
        </div>

        {/* Если ещё нет расклада — форма вопроса */}
        {!reading && !loading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Что вас волнует? Задайте свой вопрос..."
              className="w-full h-28 bg-[#1a1a2e] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              required
            />
            <button
              type="submit"
              className="mystic-btn"
              disabled={!question.trim()}
            >
              🔮 Разложить карты
            </button>
          </form>
        )}

        {/* Загрузка */}
        {loading && (
          <div className="text-center py-12">
            <div className="loading-spinner" />
            <p className="text-slate-400 mt-4">Раскладываю карты...</p>
          </div>
        )}

        {/* Результат расклада */}
        {cards && reading && (
          <div>
            {/* Три карты */}
            <div className="flex justify-center gap-3 mb-6">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="tarot-card-animate mystic-card text-center flex-1 px-2 py-4"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="text-3xl mb-2">
                    {i === 0 ? '🕰️' : i === 1 ? '⚡' : '🌅'}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    {i === 0 ? 'Прошлое' : i === 1 ? 'Настоящее' : 'Будущее'}
                  </div>
                  <div className="text-sm font-semibold text-purple-300">
                    {card}
                  </div>
                </div>
              ))}
            </div>

            {/* Интерпретация */}
            <div className="mystic-card">
              <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {reading}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
