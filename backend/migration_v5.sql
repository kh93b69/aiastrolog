-- Миграция v5: добавление premium_until для временных подписок
-- Выполнить в Supabase SQL Editor

-- Колонка для хранения даты окончания premium
ALTER TABLE user_limits ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- Таблица платежей для учёта покупок
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL REFERENCES users(telegram_id),
    pack_type TEXT NOT NULL,          -- 'impulse', 'vibe_week', 'vip_month'
    stars_amount INT NOT NULL,
    telegram_charge_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_telegram_id ON payments(telegram_id);
