export type IncomeCategory = '給与' | 'ボーナス' | 'その他収入';
export type LifeStage = '現役時代' | '退職後';

export interface IncomeItem {
  id: string;
  scenario_id: string;
  category: IncomeCategory;
  name: string;
  monthly_amount: number;
  bonus_times_per_year: number; // 年間ボーナス支給回数（0-12）
  bonus_amount_per_time: number; // 1回あたりのボーナス支給額
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
  bonus_times_per_year?: number;
  bonus_amount_per_time?: number;
  start_age: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface UpdateIncomeItemInput {
  category?: IncomeCategory;
  name?: string;
  monthly_amount?: number;
  bonus_times_per_year?: number;
  bonus_amount_per_time?: number;
  start_age?: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface IncomeSummary {
  total_monthly: number;
  total_annual: number;
  by_category: Record<IncomeCategory, number>;
}

/**
 * 収入項目の年間収入を計算
 * - ボーナスカテゴリの場合: bonus_amount_per_time * bonus_times_per_year
 * - その他の場合: monthly_amount * 12
 */
export function calculateAnnualIncome(item: IncomeItem): number {
  if (item.category === 'ボーナス' && item.bonus_times_per_year > 0) {
    return item.bonus_amount_per_time * item.bonus_times_per_year;
  }
  return item.monthly_amount * 12;
}

/**
 * 収入項目の月平均額を計算
 */
export function calculateMonthlyAverage(item: IncomeItem): number {
  return calculateAnnualIncome(item) / 12;
}
