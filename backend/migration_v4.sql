-- Миграция v4: добавление реферальной системы
-- Выполнить в Supabase SQL Editor

-- Добавить колонку referrer_id в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id BIGINT;
