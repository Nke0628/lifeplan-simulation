import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type {
  CreateInvestmentSettingInput,
  UpdateInvestmentSettingInput,
} from '@/types/investment';
import { DEFAULT_INVESTMENT_SETTING } from '@/types/investment';
import type { Database } from '@/types/supabase';

// GET: 資産運用設定取得
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

    // シナリオの所有権確認
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenarioId)
      .eq('user_id', user.id)
      .single();

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const { data: investment_setting, error } = await supabase
      .from('investment_settings')
      .select('*')
      .eq('scenario_id', scenarioId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 設定が存在しない場合はデフォルト値を返す
    if (!investment_setting) {
      return NextResponse.json({
        scenario_id: scenarioId,
        ...DEFAULT_INVESTMENT_SETTING,
      });
    }

    return NextResponse.json(investment_setting);
  } catch (error) {
    console.error('Error fetching investment setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 資産運用設定作成
export async function POST(
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

    // シナリオの所有権確認
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenarioId)
      .eq('user_id', user.id)
      .single();

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const body: CreateInvestmentSettingInput = await request.json();

    const { data: investment_setting, error } = await supabase
      .from('investment_settings')
      .insert({
        scenario_id: scenarioId,
        initial_amount: body.initial_amount ?? DEFAULT_INVESTMENT_SETTING.initial_amount,
        monthly_contribution:
          body.monthly_contribution ?? DEFAULT_INVESTMENT_SETTING.monthly_contribution,
        expected_return_rate:
          body.expected_return_rate ?? DEFAULT_INVESTMENT_SETTING.expected_return_rate,
        tax_rate: body.tax_rate ?? DEFAULT_INVESTMENT_SETTING.tax_rate,
      } satisfies Database['public']['Tables']['investment_settings']['Insert'])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(investment_setting, { status: 201 });
  } catch (error) {
    console.error('Error creating investment setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: 資産運用設定更新
export async function PUT(
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

    // 所有権確認
    const { data: existing } = await supabase
      .from('investment_settings')
      .select('*, scenarios!inner(user_id)')
      .eq('scenario_id', scenarioId)
      .eq('scenarios.user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Investment setting not found' },
        { status: 404 }
      );
    }

    const body: UpdateInvestmentSettingInput = await request.json();

    const { data: investment_setting, error } = await supabase
      .from('investment_settings')
      .update(body satisfies Database['public']['Tables']['investment_settings']['Update'])
      .eq('scenario_id', scenarioId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(investment_setting);
  } catch (error) {
    console.error('Error updating investment setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
