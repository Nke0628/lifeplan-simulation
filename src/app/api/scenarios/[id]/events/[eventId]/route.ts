import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateLifeEventInput } from '@/types/lifeEvent';

// GET: ライフイベント詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id: scenarioId, eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: life_event, error } = await supabase
      .from('life_events')
      .select('*, scenarios!inner(user_id)')
      .eq('id', eventId)
      .eq('scenario_id', scenarioId)
      .eq('scenarios.user_id', user.id)
      .single();

    if (error || !life_event) {
      return NextResponse.json(
        { error: 'Life event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(life_event);
  } catch (error) {
    console.error('Error fetching life event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: ライフイベント更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id: scenarioId, eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 所有権確認
    const { data: existing } = await supabase
      .from('life_events')
      .select('*, scenarios!inner(user_id)')
      .eq('id', eventId)
      .eq('scenario_id', scenarioId)
      .eq('scenarios.user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Life event not found' },
        { status: 404 }
      );
    }

    const body: UpdateLifeEventInput = await request.json();

    const { data: life_event, error } = await supabase
      .from('life_events')
      .update(body as any)
      .eq('id', eventId)
      .eq('scenario_id', scenarioId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(life_event);
  } catch (error) {
    console.error('Error updating life event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: ライフイベント削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id: scenarioId, eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 所有権確認
    const { data: existing } = await supabase
      .from('life_events')
      .select('*, scenarios!inner(user_id)')
      .eq('id', eventId)
      .eq('scenario_id', scenarioId)
      .eq('scenarios.user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Life event not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('life_events')
      .delete()
      .eq('id', eventId)
      .eq('scenario_id', scenarioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting life event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
