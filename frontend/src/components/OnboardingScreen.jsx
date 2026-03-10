import { useState } from 'react';

export default function OnboardingScreen({ onComplete, loading }) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!birthDate || !birthTime || !birthPlace) return;
    onComplete(birthDate, birthTime, birthPlace);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="text-5xl text-center mb-4">🌟</div>

        <h2 className="text-2xl font-bold text-center mb-2">
          Ваш космический профиль
        </h2>
        <p className="text-slate-400 text-center mb-8">
          Укажите данные рождения для персональных прогнозов
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Дата рождения */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Дата рождения
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Время рождения */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Время рождения
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Место рождения */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Место рождения
            </label>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="Например: Москва"
              className="w-full bg-[#1a1a2e] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="mystic-btn mt-4"
            disabled={loading || !birthDate || !birthTime || !birthPlace}
          >
            {loading ? 'Сохраняем...' : '🌙 Сохранить и продолжить'}
          </button>
        </form>
      </div>
    </div>
  );
}
