-- Add bonus fields to income_items table
-- LS-29: 収入項目のボーナス機能拡張

-- Add new columns for bonus functionality
ALTER TABLE income_items
ADD COLUMN IF NOT EXISTS bonus_times_per_year INTEGER DEFAULT 0 CHECK (bonus_times_per_year >= 0 AND bonus_times_per_year <= 12),
ADD COLUMN IF NOT EXISTS bonus_amount_per_time DECIMAL(12,2) DEFAULT 0 CHECK (bonus_amount_per_time >= 0);

-- Migrate existing bonus category data
-- Existing bonus items will be treated as monthly (12 times per year)
UPDATE income_items
SET
  bonus_times_per_year = 12,
  bonus_amount_per_time = monthly_amount
WHERE category = 'ボーナス'
  AND bonus_times_per_year = 0;

-- Add comment to columns
COMMENT ON COLUMN income_items.bonus_times_per_year IS '年間ボーナス支給回数（0-12回）。0の場合は月額収入として扱う';
COMMENT ON COLUMN income_items.bonus_amount_per_time IS '1回あたりのボーナス支給額';
