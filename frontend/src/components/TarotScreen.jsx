import { useState } from 'react';

export default function TarotScreen({ onSubmit, reading, cards, loading, onBack }) {
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState(null); // null = выбор типа
  const [category, setCategory] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question, spreadType, category);
  }

  // Этап 1: Выбор типа расклада
  if (!spreadType && !reading && !loading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-sm mx-auto animate-fade-in">
          <button onClick={onBack} className="text-slate-400 mb-6 flex items-center gap-2">
            ← Назад
          </button>

          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🃏</div>
            <h2 className="text-2xl font-bold">Астро-Таро</h2>
            <p className="text-slate-400 text-sm mt-2">Выбери тип расклада</p>
          </div>

          {/* Прошлое-Настоящее-Будущее */}
          <div
            className="mystic-card mb-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setSpreadType('past_present_future')}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🕰️</div>
              <div>
                <h3 className="font-semibold">Прошлое — Настоящее — Будущее</h3>
                <p className="text-sm text-slate-400">Классический расклад на 3 карты</p>
              </div>
            </div>
          </div>

          {/* По категориям */}
          <p className="text-sm text-slate-400 mt-6 mb-3 px-1">Расклад по сфере жизни:</p>

          <div
            className="mystic-card mb-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => { setSpreadType('category'); setCategory('relationships'); }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">💕</div>
              <div>
                <h3 className="font-semibold">Отношения</h3>
                <p className="text-sm text-slate-400">Любовь, партнёрство, связи</p>
              </div>
            </div>
          </div>

          <div
            className="mystic-card mb-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => { setSpreadType('category'); setCategory('work_money'); }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="font-semibold">Работа и деньги</h3>
                <p className="text-sm text-slate-400">Карьера, финансы, проекты</p>
              </div>
            </div>
          </div>

          <div
            className="mystic-card mb-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => { setSpreadType('category'); setCategory('self_discovery'); }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🧘</div>
              <div>
                <h3 className="font-semibold">Самопознание</h3>
                <p className="text-sm text-slate-400">Внутренний мир, рост, предназначение</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Названия для карточек в зависимости от типа расклада
  const cardLabels = spreadType === 'past_present_future'
    ? ['Прошлое', 'Настоящее', 'Будущее']
    : ['Ситуация', 'Препятствие', 'Совет'];

  const cardEmojis = spreadType === 'past_present_future'
    ? ['🕰️', '⚡', '🌅']
    : ['🔍', '⚠️', '💡'];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">
        <button
          onClick={() => {
            if (!reading && !loading) {
              setSpreadType(null);
              setCategory(null);
            } else {
              onBack();
            }
          }}
          className="text-slate-400 mb-6 flex items-center gap-2"
        >
          ← Назад
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🃏</div>
          <h2 className="text-2xl font-bold">Астро-Таро</h2>
          <p className="text-slate-400 text-sm mt-2">
            Задай вопрос — карты и звёзды дадут ответ
          </p>
        </div>

        {/* Форма вопроса */}
        {!reading && !loading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Что тебя волнует? Задай свой вопрос..."
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
            <p className="text-slate-400 mt-4">Раскладываю карты и сверяю со звёздами...</p>
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
                  <div className="text-3xl mb-2">{cardEmojis[i]}</div>
                  <div className="text-xs text-slate-400 mb-1">{cardLabels[i]}</div>
                  <div className="text-sm font-semibold text-purple-300">{card}</div>
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
