export default function WelcomeScreen({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in">
        {/* Мистический символ */}
        <div className="text-8xl mb-6">🔮</div>

        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
          Новелла
        </h1>

        <p className="text-slate-400 text-lg mb-8 max-w-sm">
          Твой персональный астролог — прогнозы по натальной карте
          и расклады Таро
        </p>

        <button className="mystic-btn text-lg" onClick={onStart}>
          ✨ Начать путь
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Звёзды уже ждут вас
        </p>
      </div>
    </div>
  );
}
