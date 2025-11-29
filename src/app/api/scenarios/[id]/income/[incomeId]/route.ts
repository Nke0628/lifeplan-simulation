import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { UpdateIncomeItemInput } from "@/types/income";

// PUT: 収入項目更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; incomeId: string }> }
) {
  try {
    const { id: scenarioId, incomeId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateIncomeItemInput = await request.json();

    // Validate ownership
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("user_id")
      .eq("id", scenarioId)
      .single();

    if (!scenario || scenario.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: income_item, error } = await supabase
      .from("income_items")
      .update(body)
      .eq("id", incomeId)
      .eq("scenario_id", scenarioId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(income_item);
  } catch (error) {
    console.error("Error updating income item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: 収入項目削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; incomeId: string }> }
) {
  try {
    const { id: scenarioId, incomeId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ownership
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("user_id")
      .eq("id", scenarioId)
      .single();

    if (!scenario || scenario.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("income_items")
      .delete()
      .eq("id", incomeId)
      .eq("scenario_id", scenarioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting income item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
