import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';
import { Plus, BarChart3, GitCompare, HelpCircle, ArrowRight } from 'lucide-react';
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
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
            ダッシュボード
          </h1>
          <p className="text-lg text-gray-600">ようこそ、{user.email} さん</p>
        </div>

        {/* 全体サマリー */}
        {scenarios && scenarios.length > 0 && (
          <OverallSummary
            scenariosCount={scenarios.length}
            simulationResults={scenariosWithResults.map((s) => s.result)}
          />
        )}

        {/* クイックアクション */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">クイックアクション</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/scenarios/new"
              className="group block p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-primary-200 hover:-translate-y-1"
            >
              <div className="bg-primary-500 rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">新規シナリオ作成</h3>
              <p className="text-sm text-gray-700">新しいライフプランシミュレーションを開始</p>
            </Link>

            <Link
              href="/scenarios"
              className="group block p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-200 hover:-translate-y-1"
            >
              <div className="bg-secondary-500 rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">シナリオ一覧</h3>
              <p className="text-sm text-gray-700">作成したシナリオを確認・編集</p>
            </Link>

            <Link
              href="/scenarios/compare"
              className="group block p-6 bg-gradient-to-br from-success-50 to-success-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-success-200 hover:-translate-y-1"
            >
              <div className="bg-success-500 rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <GitCompare className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">シナリオ比較</h3>
              <p className="text-sm text-gray-700">複数のシナリオを並列比較</p>
            </Link>

            <Link
              href="/help"
              className="group block p-6 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-warning-200 hover:-translate-y-1"
            >
              <div className="bg-warning-500 rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">ヘルプ</h3>
              <p className="text-sm text-gray-700">使い方やFAQを確認</p>
            </Link>
          </div>
        </div>

        {/* シナリオサマリー */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最近のシナリオ</h2>
            {scenariosWithResults && scenariosWithResults.length > 0 && (
              <Link
                href="/scenarios"
                className="group inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                すべて見る
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {!scenariosWithResults || scenariosWithResults.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md border border-gray-200 p-12">
              <div className="text-center">
                <div className="bg-gray-200 rounded-full p-4 w-fit mx-auto mb-4">
                  <BarChart3 className="text-gray-400" size={48} />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-2">
                  まだシナリオがありません
                </p>
                <p className="text-gray-500 text-sm">
                  新規シナリオを作成してライフプランシミュレーションを開始しましょう
                </p>
              </div>
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
