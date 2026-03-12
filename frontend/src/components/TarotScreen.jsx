import { useState } from 'react';
import { getCardData } from '../tarotCards';

// Компонент одной карты Таро с анимацией переворота
function TarotCard({ card, label, emoji, delay, flipped }) {
  const data = getCardData(card);

  return (
    <div
      className="tarot-card-container flex-1"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-xs text-slate-400 mb-2 text-center">{label}</div>
      <div className={`tarot-card-flip ${flipped ? 'flipped' : ''}`}>
        {/* Рубашка карты */}
        <div className="tarot-card-face tarot-card-back">
          <div className="tarot-back-pattern">
            <div className="tarot-back-symbol">✦</div>
          </div>
        </div>
        {/* Лицевая сторона */}
        <div className="tarot-card-face tarot-card-front" style={{ borderColor: data.color + '80' }}>
          {data.isMajor ? (
            <>
              <div className="tarot-card-number" style={{ color: data.color }}>
                {data.displayNumber}
              </div>
              <div className="tarot-card-symbol">{data.symbol}</div>
              <div className="tarot-card-name">{data.name}</div>
            </>
          ) : (
            <>
              <div className="tarot-card-rank" style={{ color: data.color }}>
                {data.rank}
              </div>
              <div className="tarot-card-symbol">{data.symbol}</div>
              <div className="tarot-card-suit-symbol" style={{ color: data.color }}>
                {data.suitSymbol}
              </div>
              <div className="tarot-card-name">{data.name}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TarotScreen({ onSubmit, reading, cards, loading, onBack }) {
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState(null);
  const [category, setCategory] = useState(null);
  const [cardsFlipped, setCardsFlipped] = useState([false, false, false]);

  // Последовательно переворачиваем карты
  function flipCardsSequentially() {
    setTimeout(() => setCardsFlipped([true, false, false]), 500);
    setTimeout(() => setCardsFlipped([true, true, false]), 1200);
    setTimeout(() => setCardsFlipped([true, true, true]), 1900);
  }

  // Если карты пришли — запускаем анимацию
  if (cards && !cardsFlipped[0]) {
    flipCardsSequentially();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setCardsFlipped([false, false, false]);
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
            if (reading || loading) {
              onBack();
            } else {
              setSpreadType(null);
              setCategory(null);
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
            {/* Три карты с анимацией переворота */}
            <div className="flex justify-center gap-3 mb-6">
              {cards.map((card, i) => (
                <TarotCard
                  key={i}
                  card={card}
                  label={cardLabels[i]}
                  emoji={cardEmojis[i]}
                  delay={i * 0.3}
                  flipped={cardsFlipped[i]}
                />
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
