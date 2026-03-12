// Маппинг карт Таро: название → номер (для изображений) и символ
// Номера соответствуют колоде Райдера-Уэйта

const MAJOR_ARCANA = {
  "Шут": { number: 0, symbol: "🃏", color: "#f0e68c" },
  "Маг": { number: 1, symbol: "✨", color: "#ffd700" },
  "Верховная Жрица": { number: 2, symbol: "🌙", color: "#4169e1" },
  "Императрица": { number: 3, symbol: "👑", color: "#32cd32" },
  "Император": { number: 4, symbol: "🏛️", color: "#dc143c" },
  "Иерофант": { number: 5, symbol: "🔑", color: "#8b0000" },
  "Влюблённые": { number: 6, symbol: "💕", color: "#ff69b4" },
  "Колесница": { number: 7, symbol: "⚡", color: "#4682b4" },
  "Сила": { number: 8, symbol: "🦁", color: "#ff8c00" },
  "Отшельник": { number: 9, symbol: "🏔️", color: "#708090" },
  "Колесо Фортуны": { number: 10, symbol: "☸️", color: "#9370db" },
  "Справедливость": { number: 11, symbol: "⚖️", color: "#b8860b" },
  "Повешенный": { number: 12, symbol: "🔮", color: "#4169e1" },
  "Смерть": { number: 13, symbol: "🌑", color: "#2f4f4f" },
  "Умеренность": { number: 14, symbol: "🌊", color: "#20b2aa" },
  "Дьявол": { number: 15, symbol: "🔥", color: "#8b0000" },
  "Башня": { number: 16, symbol: "⚡", color: "#ff4500" },
  "Звезда": { number: 17, symbol: "⭐", color: "#87ceeb" },
  "Луна": { number: 18, symbol: "🌙", color: "#483d8b" },
  "Солнце": { number: 19, symbol: "☀️", color: "#ffa500" },
  "Суд": { number: 20, symbol: "📯", color: "#cd853f" },
  "Мир": { number: 21, symbol: "🌍", color: "#9370db" },
};

const SUIT_INFO = {
  "Жезлов": { symbol: "🔥", color: "#e74c3c", suitSymbol: "♣" },
  "Кубков": { symbol: "💧", color: "#3498db", suitSymbol: "♥" },
  "Мечей": { symbol: "💨", color: "#95a5a6", suitSymbol: "♠" },
  "Пентаклей": { symbol: "🌍", color: "#27ae60", suitSymbol: "♦" },
};

const RANK_NAMES = {
  "Туз": "A",
  "Двойка": "2",
  "Тройка": "3",
  "Четвёрка": "4",
  "Пятёрка": "5",
  "Шестёрка": "6",
  "Семёрка": "7",
  "Восьмёрка": "8",
  "Девятка": "9",
  "Десятка": "10",
  "Паж": "P",
  "Рыцарь": "Kn",
  "Королева": "Q",
  "Король": "K",
};

// Получить данные карты по русскому названию
export function getCardData(cardName) {
  // Проверяем старшие арканы
  if (MAJOR_ARCANA[cardName]) {
    const data = MAJOR_ARCANA[cardName];
    return {
      name: cardName,
      isMajor: true,
      number: data.number,
      symbol: data.symbol,
      color: data.color,
      displayNumber: data.number === 0 ? "0" : String(data.number),
    };
  }

  // Минорные арканы — парсим "Туз Жезлов", "Двойка Кубков" и т.д.
  for (const [rank, rankSymbol] of Object.entries(RANK_NAMES)) {
    for (const [suit, suitData] of Object.entries(SUIT_INFO)) {
      if (cardName === `${rank} ${suit}`) {
        return {
          name: cardName,
          isMajor: false,
          rank: rankSymbol,
          suit: suit,
          symbol: suitData.symbol,
          color: suitData.color,
          suitSymbol: suitData.suitSymbol,
        };
      }
    }
  }

  // Фоллбек
  return {
    name: cardName,
    isMajor: true,
    number: "?",
    symbol: "🃏",
    color: "#8b5cf6",
    displayNumber: "?",
  };
}
