import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Scenario } from '@/types/scenario';
import type { Database } from '@/types/supabase';

// POST: シナリオ複製（すべての関連データを含む）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 元のシナリオを取得
    const { data: originalScenario, error: fetchError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single<Scenario>();

    if (fetchError || !originalScenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // 新しいシナリオを作成
    const insertData = {
      user_id: user.id,
      name: `${originalScenario.name} (コピー)`,
      description: originalScenario.description,
      current_age: originalScenario.current_age,
      target_age: originalScenario.target_age,
      inflation_rate: originalScenario.inflation_rate,
      is_active: true,
    };

    const { data: newScenario, error: createError } = await supabase
      .from('scenarios')
      .insert(insertData satisfies Database['public']['Tables']['scenarios']['Insert'])
      .select()
      .single<Scenario>();

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // 並列で関連データを取得
    const [incomeItemsRes, expenseItemsRes, lifeEventsRes, investmentSettingRes] =
      await Promise.all([
        supabase.from('income_items').select('*').eq('scenario_id', id),
        supabase.from('expense_items').select('*').eq('scenario_id', id),
        supabase.from('life_events').select('*').eq('scenario_id', id),
        supabase
          .from('investment_settings')
          .select('*')
          .eq('scenario_id', id)
          .single(),
      ]);

    // 複製カウント
    const duplicatedCounts = {
      income_items: 0,
      expense_items: 0,
      life_events: 0,
      investment_settings: 0,
    };

    // 収入項目を複製
    if (incomeItemsRes.data && incomeItemsRes.data.length > 0) {
      const incomeItemsToInsert = incomeItemsRes.data.map((item: any) => ({
        scenario_id: newScenario.id,
        category: item.category,
        name: item.name,
        monthly_amount: item.monthly_amount,
        bonus_times_per_year: item.bonus_times_per_year,
        bonus_amount_per_time: item.bonus_amount_per_time,
        start_age: item.start_age,
        end_age: item.end_age,
        life_stage: item.life_stage,
      }));

      const { data: insertedIncome, error: incomeError } = await supabase
        .from('income_items')
        .insert(incomeItemsToInsert as any)
        .select();

      if (!incomeError && insertedIncome) {
        duplicatedCounts.income_items = insertedIncome.length;
      }
    }

    // 支出項目を複製
    if (expenseItemsRes.data && expenseItemsRes.data.length > 0) {
      const expenseItemsToInsert = expenseItemsRes.data.map((item: any) => ({
        scenario_id: newScenario.id,
        category: item.category,
        name: item.name,
        monthly_amount: item.monthly_amount,
        start_age: item.start_age,
        end_age: item.end_age,
        life_stage: item.life_stage,
      }));

      const { data: insertedExpense, error: expenseError } = await supabase
        .from('expense_items')
        .insert(expenseItemsToInsert as any)
        .select();

      if (!expenseError && insertedExpense) {
        duplicatedCounts.expense_items = insertedExpense.length;
      }
    }

    // ライフイベントを複製
    if (lifeEventsRes.data && lifeEventsRes.data.length > 0) {
      const lifeEventsToInsert = lifeEventsRes.data.map((event: any) => ({
        scenario_id: newScenario.id,
        event_type: event.event_type,
        name: event.name,
        target_age: event.target_age,
        cost: event.cost,
        duration_years: event.duration_years,
        annual_cost: event.annual_cost,
        memo: event.memo,
      }));

      const { data: insertedEvents, error: eventsError } = await supabase
        .from('life_events')
        .insert(lifeEventsToInsert as any)
        .select();

      if (!eventsError && insertedEvents) {
        duplicatedCounts.life_events = insertedEvents.length;
      }
    }

    // 資産運用設定を複製
    if (investmentSettingRes.data) {
      const setting = investmentSettingRes.data as any;
      const investmentSettingToInsert = {
        scenario_id: newScenario.id,
        initial_amount: setting.initial_amount,
        monthly_contribution: setting.monthly_contribution,
        expected_return_rate: setting.expected_return_rate,
        tax_rate: setting.tax_rate,
      };

      const { error: investmentError } = await supabase
        .from('investment_settings')
        .insert(investmentSettingToInsert as any);

      if (!investmentError) {
        duplicatedCounts.investment_settings = 1;
      }
    }

    // レスポンスを返す
    return NextResponse.json(
      {
        ...newScenario,
        duplicated_counts: duplicatedCounts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating scenario:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
