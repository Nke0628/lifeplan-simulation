export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          current_age: number;
          target_age: number;
          inflation_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          current_age?: number;
          target_age?: number;
          inflation_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      income_items: {
        Row: {
          id: string;
          scenario_id: string;
          category: string;
          name: string;
          monthly_amount: number;
          start_age: number;
          end_age: number | null;
          life_stage: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          category: string;
          name: string;
          monthly_amount: number;
          start_age: number;
          end_age?: number | null;
          life_stage?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          category?: string;
          name?: string;
          monthly_amount?: number;
          start_age?: number;
          end_age?: number | null;
          life_stage?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expense_items: {
        Row: {
          id: string;
          scenario_id: string;
          category: string;
          name: string;
          monthly_amount: number;
          start_age: number;
          end_age: number | null;
          life_stage: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          category: string;
          name: string;
          monthly_amount: number;
          start_age: number;
          end_age?: number | null;
          life_stage?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          category?: string;
          name?: string;
          monthly_amount?: number;
          start_age?: number;
          end_age?: number | null;
          life_stage?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      life_events: {
        Row: {
          id: string;
          scenario_id: string;
          event_type: string;
          name: string;
          target_age: number;
          cost: number;
          duration_years: number | null;
          annual_cost: number | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          event_type: string;
          name: string;
          target_age: number;
          cost: number;
          duration_years?: number | null;
          annual_cost?: number | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          event_type?: string;
          name?: string;
          target_age?: number;
          cost?: number;
          duration_years?: number | null;
          annual_cost?: number | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      investment_settings: {
        Row: {
          id: string;
          scenario_id: string;
          initial_savings: number;
          initial_investment_amount: number;
          monthly_contribution: number;
          expected_return_rate: number;
          tax_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          initial_savings?: number;
          initial_investment_amount?: number;
          monthly_contribution?: number;
          expected_return_rate?: number;
          tax_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          initial_savings?: number;
          initial_investment_amount?: number;
          monthly_contribution?: number;
          expected_return_rate?: number;
          tax_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
