import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateExpenseItemInput } from '@/types/expense';

// PUT: 支出項目更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: scenarioId, expenseId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateExpenseItemInput = await request.json();

    // Validate ownership
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('user_id')
      .eq('id', scenarioId)
      .single();

    if (!scenario || scenario.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: expense_item, error } = await supabase
      .from('expense_items')
      .update(body as any)
      .eq('id', expenseId)
      .eq('scenario_id', scenarioId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(expense_item);
  } catch (error) {
    console.error('Error updating expense item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: 支出項目削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: scenarioId, expenseId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ownership
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('user_id')
      .eq('id', scenarioId)
      .single();

    if (!scenario || scenario.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('expense_items')
      .delete()
      .eq('id', expenseId)
      .eq('scenario_id', scenarioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting expense item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
