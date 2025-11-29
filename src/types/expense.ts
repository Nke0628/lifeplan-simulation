export type ExpenseCategory =
  | '生活費'
  | '住居費'
  | '娯楽費'
  | '交通費'
  | '保険料'
  | 'その他';
export type LifeStage = '現役時代' | '退職後';

export interface ExpenseItem {
  id: string;
  scenario_id: string;
  category: ExpenseCategory;
  name: string;
  monthly_amount: number;
  start_age: number;
  end_age: number | null;
  life_stage: LifeStage | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseItemInput {
  scenario_id: string;
  category: ExpenseCategory;
  name: string;
  monthly_amount: number;
  start_age: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface UpdateExpenseItemInput {
  category?: ExpenseCategory;
  name?: string;
  monthly_amount?: number;
  start_age?: number;
  end_age?: number | null;
  life_stage?: LifeStage | null;
}

export interface ExpenseSummary {
  total_monthly: number;
  total_annual: number;
  by_category: Record<ExpenseCategory, number>;
}
