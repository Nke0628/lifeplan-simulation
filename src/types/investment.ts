export interface InvestmentSetting {
  id: string;
  scenario_id: string;
  initial_savings: number; // 現在の貯蓄額（総資産）
  initial_investment_amount: number; // 初期運用資産額
  monthly_contribution: number;
  expected_return_rate: number;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentSettingInput {
  scenario_id: string;
  initial_savings?: number;
  initial_investment_amount?: number;
  monthly_contribution?: number;
  expected_return_rate?: number;
  tax_rate?: number;
}

export interface UpdateInvestmentSettingInput {
  initial_savings?: number;
  initial_investment_amount?: number;
  monthly_contribution?: number;
  expected_return_rate?: number;
  tax_rate?: number;
}

// デフォルト値
export const DEFAULT_INVESTMENT_SETTING = {
  initial_savings: 0,
  initial_investment_amount: 0,
  monthly_contribution: 0,
  expected_return_rate: 3.0,
  tax_rate: 20.315,
};
