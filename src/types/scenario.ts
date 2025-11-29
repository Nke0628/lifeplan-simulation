export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  current_age: number;
  target_age: number;
  inflation_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScenarioInput {
  name: string;
  description?: string | null;
  current_age: number;
  target_age: number;
  inflation_rate?: number;
}

export interface UpdateScenarioInput {
  name?: string;
  description?: string | null;
  current_age?: number;
  target_age?: number;
  inflation_rate?: number;
  is_active?: boolean;
}

export interface ScenarioSummary extends Scenario {
  income_count?: number;
  expense_count?: number;
  event_count?: number;
}
