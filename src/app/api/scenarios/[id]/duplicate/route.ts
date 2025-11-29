import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Scenario } from '@/types/scenario';
import type { Database } from '@/types/supabase';

// POST: シナリオ複製
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

    return NextResponse.json(newScenario, { status: 201 });
  } catch (error) {
    console.error('Error duplicating scenario:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
