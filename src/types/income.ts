export type IncomeCategory = '給与' | 'ボーナス' | 'その他収入';
export type LifeStage = '現役時代' | '退職後';

export interface IncomeItem {
  id: string;
  scenario_id: string;
  category: IncomeCategory;
  name: string;
  monthly_amount: number;
  start_age: number;
  end_age: number | null;
  life_stage: LifeStage | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeItemInput {
  scenario_id: string;
  category: IncomeCategory;
  name: string;
  monthly_amount: number;
  start_age: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface UpdateIncomeItemInput {
  category?: IncomeCategory;
  name?: string;
  monthly_amount?: number;
  start_age?: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface IncomeSummary {
  total_monthly: number;
  total_annual: number;
  by_category: Record<IncomeCategory, number>;
}
