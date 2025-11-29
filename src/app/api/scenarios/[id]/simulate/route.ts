import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/simulationEngine';
import { DEFAULT_INVESTMENT_SETTING } from '@/types/investment';

// GET: シミュレーション実行
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scenarioId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // シナリオ取得
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .eq('user_id', user.id)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    // 収入項目取得
    const { data: incomeItems } = await supabase
      .from('income_items')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('start_age', { ascending: true });

    // 支出項目取得
    const { data: expenseItems } = await supabase
      .from('expense_items')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('start_age', { ascending: true });

    // ライフイベント取得
    const { data: lifeEvents } = await supabase
      .from('life_events')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('target_age', { ascending: true });

    // 資産運用設定取得
    const { data: investmentSetting } = await supabase
      .from('investment_settings')
      .select('*')
      .eq('scenario_id', scenarioId)
      .single();

    // シミュレーション実行
    const result = runSimulation({
      scenario,
      incomeItems: incomeItems || [],
      expenseItems: expenseItems || [],
      lifeEvents: lifeEvents || [],
      investmentSetting: investmentSetting || DEFAULT_INVESTMENT_SETTING,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
