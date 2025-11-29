-- Update investment_settings table to separate initial savings and investment amount
-- LS-30: 初期貯蓄額と初期運用資産の分離管理機能

-- Add new columns
ALTER TABLE investment_settings
ADD COLUMN IF NOT EXISTS initial_savings DECIMAL(12,2) DEFAULT 0 CHECK (initial_savings >= 0),
ADD COLUMN IF NOT EXISTS initial_investment_amount DECIMAL(12,2) DEFAULT 0 CHECK (initial_investment_amount >= 0);

-- Add constraint: investment amount cannot exceed savings
ALTER TABLE investment_settings
ADD CONSTRAINT check_investment_not_exceed_savings
CHECK (initial_investment_amount <= initial_savings);

-- Drop old column
ALTER TABLE investment_settings
DROP COLUMN IF EXISTS initial_amount;

-- Add comments for documentation
COMMENT ON COLUMN investment_settings.initial_savings IS '現在の貯蓄額（総資産）。シミュレーション開始時の全資産（銀行預金、現金、投資資産などの合計）';
COMMENT ON COLUMN investment_settings.initial_investment_amount IS '初期運用資産額。initial_savingsのうち実際に運用する金額（生活防衛資金を除く）';
