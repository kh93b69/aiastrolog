-- Таблица пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    birth_date TEXT,
    birth_time TEXT,
    birth_place TEXT,
    onboarding_done BOOLEAN DEFAULT FALSE,
    referrer_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица лимитов
CREATE TABLE user_limits (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL REFERENCES users(telegram_id),
    horoscope_used INT DEFAULT 0,
    tarot_used INT DEFAULT 0,
    horoscope_limit INT DEFAULT 2,
    tarot_limit INT DEFAULT 3,
    is_premium BOOLEAN DEFAULT FALSE,
    week_start TIMESTAMPTZ DEFAULT DATE_TRUNC('week', NOW())
);

-- Таблица истории чтений
CREATE TABLE readings (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL REFERENCES users(telegram_id),
    reading_type TEXT NOT NULL,  -- 'horoscope' или 'tarot'
    question TEXT,
    response TEXT,
    cards JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_readings_telegram_id ON readings(telegram_id);
CREATE INDEX idx_readings_created_at ON readings(created_at);
