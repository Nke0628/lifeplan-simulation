-- ライフプランシミュレーション - 初期スキーマ
-- 作成日: 2025-11-22
-- 注: PostgreSQL組み込みのgen_random_uuid()を使用（uuid-ossp不要）

-- ====================================
-- テーブル作成
-- ====================================

-- users テーブル
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- scenarios テーブル
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  current_age INTEGER NOT NULL,
  target_age INTEGER NOT NULL,
  inflation_rate DECIMAL(5,2) DEFAULT 2.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- income_items テーブル
CREATE TABLE public.income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  monthly_amount DECIMAL(12,2) NOT NULL,
  start_age INTEGER NOT NULL,
  end_age INTEGER,
  life_stage VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- expense_items テーブル
CREATE TABLE public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  monthly_amount DECIMAL(12,2) NOT NULL,
  start_age INTEGER NOT NULL,
  end_age INTEGER,
  life_stage VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- life_events テーブル
CREATE TABLE public.life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  target_age INTEGER NOT NULL,
  cost DECIMAL(12,2) NOT NULL,
  duration_years INTEGER,
  annual_cost DECIMAL(12,2),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- investment_settings テーブル
CREATE TABLE public.investment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL UNIQUE REFERENCES public.scenarios(id) ON DELETE CASCADE,
  initial_amount DECIMAL(12,2) DEFAULT 0,
  monthly_contribution DECIMAL(12,2) DEFAULT 0,
  expected_return_rate DECIMAL(5,2) DEFAULT 3.0,
  tax_rate DECIMAL(5,2) DEFAULT 20.315,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- インデックス作成
-- ====================================

-- scenarios テーブル
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);
CREATE INDEX idx_scenarios_is_active ON public.scenarios(is_active);

-- income_items テーブル
CREATE INDEX idx_income_items_scenario_id ON public.income_items(scenario_id);
CREATE INDEX idx_income_items_category ON public.income_items(category);

-- expense_items テーブル
CREATE INDEX idx_expense_items_scenario_id ON public.expense_items(scenario_id);
CREATE INDEX idx_expense_items_category ON public.expense_items(category);

-- life_events テーブル
CREATE INDEX idx_life_events_scenario_id ON public.life_events(scenario_id);
CREATE INDEX idx_life_events_event_type ON public.life_events(event_type);
CREATE INDEX idx_life_events_target_age ON public.life_events(target_age);

-- investment_settings テーブル
CREATE INDEX idx_investment_settings_scenario_id ON public.investment_settings(scenario_id);

-- ====================================
-- updated_at 自動更新用トリガー関数
-- ====================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_items_updated_at
  BEFORE UPDATE ON public.income_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
  BEFORE UPDATE ON public.expense_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_events_updated_at
  BEFORE UPDATE ON public.life_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_settings_updated_at
  BEFORE UPDATE ON public.investment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 新規ユーザー自動作成トリガー
-- ====================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- Row Level Security (RLS) の有効化
-- ====================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_settings ENABLE ROW LEVEL SECURITY;

-- ====================================
-- RLS ポリシー設定
-- ====================================

-- users テーブルのポリシー
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- scenarios テーブルのポリシー
CREATE POLICY "Users can view their own scenarios"
  ON public.scenarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios"
  ON public.scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios"
  ON public.scenarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios"
  ON public.scenarios FOR DELETE
  USING (auth.uid() = user_id);

-- income_items テーブルのポリシー
CREATE POLICY "Users can view income items in their scenarios"
  ON public.income_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = income_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create income items in their scenarios"
  ON public.income_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = income_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update income items in their scenarios"
  ON public.income_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = income_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete income items in their scenarios"
  ON public.income_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = income_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

-- expense_items テーブルのポリシー
CREATE POLICY "Users can view expense items in their scenarios"
  ON public.expense_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = expense_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expense items in their scenarios"
  ON public.expense_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = expense_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expense items in their scenarios"
  ON public.expense_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = expense_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expense items in their scenarios"
  ON public.expense_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = expense_items.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

-- life_events テーブルのポリシー
CREATE POLICY "Users can view life events in their scenarios"
  ON public.life_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = life_events.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create life events in their scenarios"
  ON public.life_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = life_events.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update life events in their scenarios"
  ON public.life_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = life_events.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete life events in their scenarios"
  ON public.life_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = life_events.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

-- investment_settings テーブルのポリシー
CREATE POLICY "Users can view investment settings in their scenarios"
  ON public.investment_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = investment_settings.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create investment settings in their scenarios"
  ON public.investment_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = investment_settings.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update investment settings in their scenarios"
  ON public.investment_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = investment_settings.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete investment settings in their scenarios"
  ON public.investment_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = investment_settings.scenario_id
      AND scenarios.user_id = auth.uid()
    )
  );
