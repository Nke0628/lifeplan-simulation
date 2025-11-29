import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';
import type { Scenario } from '@/types/scenario';
import { ScenarioSummaryCard } from '@/components/dashboard/ScenarioSummaryCard';
import { OverallSummary } from '@/components/dashboard/OverallSummary';
import { runSimulation } from '@/lib/simulationEngine';
import { DEFAULT_INVESTMENT_SETTING } from '@/types/investment';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 最近のシナリオを取得（最大3件）
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(3) as { data: Scenario[] | null };

  // 各シナリオのシミュレーション結果を取得
  const scenariosWithResults = await Promise.all(
    (scenarios || []).map(async (scenario) => {
      try {
        // 収入項目取得
        const { data: incomeItems } = await supabase
          .from('income_items')
          .select('*')
          .eq('scenario_id', scenario.id);

        // 支出項目取得
        const { data: expenseItems } = await supabase
          .from('expense_items')
          .select('*')
          .eq('scenario_id', scenario.id);

        // ライフイベント取得
        const { data: lifeEvents } = await supabase
          .from('life_events')
          .select('*')
          .eq('scenario_id', scenario.id);

        // 資産運用設定取得
        const { data: investmentSetting } = await supabase
          .from('investment_settings')
          .select('*')
          .eq('scenario_id', scenario.id)
          .single();

        // シミュレーション実行
        const result = runSimulation({
          scenario,
          incomeItems: incomeItems || [],
          expenseItems: expenseItems || [],
          lifeEvents: lifeEvents || [],
          investmentSetting: investmentSetting || DEFAULT_INVESTMENT_SETTING,
        });

        return { scenario, result };
      } catch (error) {
        console.error(`Failed to run simulation for scenario ${scenario.id}:`, error);
        return { scenario, result: null };
      }
    })
  );

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">ようこそ、{user.email} さん</p>
        </div>

        {/* 全体サマリー */}
        {scenarios && scenarios.length > 0 && (
          <OverallSummary
            scenariosCount={scenarios.length}
            simulationResults={scenariosWithResults.map((s) => s.result)}
          />
        )}

        {/* クイックアクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/scenarios/new"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="text-3xl mb-2">➕</div>
              <h3 className="font-semibold text-gray-900 mb-1">新規シナリオ作成</h3>
              <p className="text-sm text-gray-600">新しいライフプランシミュレーションを開始</p>
            </Link>

            <Link
              href="/scenarios"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-1">シナリオ一覧</h3>
              <p className="text-sm text-gray-600">作成したシナリオを確認・編集</p>
            </Link>

            <Link
              href="/scenarios/compare"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-1">シナリオ比較</h3>
              <p className="text-sm text-gray-600">複数のシナリオを並列比較</p>
            </Link>

            <Link
              href="/help"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="text-3xl mb-2">❓</div>
              <h3 className="font-semibold text-gray-900 mb-1">ヘルプ</h3>
              <p className="text-sm text-gray-600">使い方やFAQを確認</p>
            </Link>
          </div>
        </div>

        {/* シナリオサマリー */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">最近のシナリオ</h2>
            {scenariosWithResults && scenariosWithResults.length > 0 && (
              <Link
                href="/scenarios"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る →
              </Link>
            )}
          </div>

          {!scenariosWithResults || scenariosWithResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <p className="text-gray-500 text-center py-8">
                まだシナリオがありません。新規シナリオを作成してください。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenariosWithResults.map(({ scenario, result }) => (
                <ScenarioSummaryCard
                  key={scenario.id}
                  scenario={scenario}
                  simulationResult={result}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
