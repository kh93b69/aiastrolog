import { useState } from 'react';

const PACKS = [
  {
    id: 'impulse',
    title: 'Мистический импульс',
    subtitle: '1 расклад + 1 прогноз',
    stars: 25,
    emoji: '✨',
    gradient: 'from-violet-600 to-purple-500',
    border: 'border-violet-500/30',
    glow: 'hover:shadow-violet-500/20',
  },
  {
    id: 'vibe_week',
    title: 'Вайб недели',
    subtitle: '5 раскладов + безлимит прогнозов на 7 дней',
    stars: 99,
    emoji: '🌊',
    gradient: 'from-purple-600 to-indigo-500',
    border: 'border-purple-500/40',
    glow: 'hover:shadow-purple-500/25',
    badge: 'Популярный',
  },
  {
    id: 'vip_month',
    title: 'Подружка Новеллы',
    subtitle: 'Безлимит на всё на 30 дней',
    stars: 299,
    emoji: '👑',
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/40',
    glow: 'hover:shadow-amber-500/25',
    badge: 'VIP',
  },
];

export default function PacksModal({ onClose, onBuy, buying }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Затемнение */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className="relative w-full max-w-sm bg-[#0f0f23] rounded-t-3xl border-t border-purple-500/30 animate-fade-in pb-8">
        {/* Ручка */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Заголовок */}
        <div className="text-center px-6 mb-5">
          <div className="text-3xl mb-2">🔮</div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Наполни Новеллу энергией
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Открой портал инсайтов
          </p>
        </div>

        {/* Пакеты */}
        <div className="px-4 space-y-3">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onBuy(pack.id)}
              disabled={buying}
              className={`w-full relative rounded-2xl border ${pack.border} bg-[#1a1a2e] p-4
                transition-all active:scale-[0.98] ${pack.glow} hover:shadow-lg
                disabled:opacity-50 disabled:cursor-wait`}
            >
              {/* Бейдж */}
              {pack.badge && (
                <span className={`absolute -top-2 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full
                  bg-gradient-to-r ${pack.gradient} text-white`}>
                  {pack.badge}
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className="text-3xl">{pack.emoji}</div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-slate-200">
                    {pack.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {pack.subtitle}
                  </div>
                </div>
                <div className={`text-sm font-bold bg-gradient-to-r ${pack.gradient} bg-clip-text text-transparent`}>
                  {pack.stars} ⭐
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Подпись */}
        <p className="text-center text-slate-600 text-[10px] mt-4 px-6">
          Оплата через Telegram Stars. Средства списываются мгновенно.
        </p>
      </div>
    </div>
  );
}
