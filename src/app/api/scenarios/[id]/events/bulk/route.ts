import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { EVENT_TEMPLATES } from '@/types/lifeEvent';
import type { Database } from '@/types/supabase';

interface BulkEventRequest {
  events: Array<{
    template_index: number;
    target_age: number;
  }>;
}

// POST: ライフイベント一括作成
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

    const body: BulkEventRequest = await request.json();

    // バリデーション
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: events array is required' },
        { status: 400 }
      );
    }

    // 各イベントのバリデーション
    for (const event of body.events) {
      if (
        typeof event.template_index !== 'number' ||
        event.template_index < 0 ||
        event.template_index >= EVENT_TEMPLATES.length
      ) {
        return NextResponse.json(
          { error: `Invalid template_index: ${event.template_index}` },
          { status: 400 }
        );
      }

      if (
        typeof event.target_age !== 'number' ||
        event.target_age < 0 ||
        event.target_age > 120
      ) {
        return NextResponse.json(
          { error: `Invalid target_age: ${event.target_age}` },
          { status: 400 }
        );
      }
    }

    // テンプレートから実際のイベントデータに変換
    const eventsToInsert = body.events.map((event) => {
      const template = EVENT_TEMPLATES[event.template_index];
      return {
        scenario_id: scenarioId,
        event_type: template.event_type,
        name: template.name,
        target_age: event.target_age,
        cost: template.estimated_cost,
        duration_years: template.duration_years || null,
        annual_cost: template.annual_cost || null,
        memo: template.description || null,
      } satisfies Database['public']['Tables']['life_events']['Insert'];
    });

    // 一括挿入
    const { data: created_events, error } = await supabase
      .from('life_events')
      .insert(eventsToInsert)
      .select();

    if (error) {
      console.error('Error creating bulk events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        created_count: created_events.length,
        events: created_events,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in bulk event creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
