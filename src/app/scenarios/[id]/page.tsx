import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ScenarioLayout } from '@/components/ScenarioLayout';
import { ScenarioActions } from '@/components/ScenarioActions';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScenarioDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: scenario, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !scenario) {
    notFound();
  }

  return (
    <ScenarioLayout scenarioId={id}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {scenario.name}
              </h1>
              {scenario.description && (
                <p className="text-gray-600">{scenario.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/scenarios/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              ✏️ 基本情報を編集
            </Link>
            <ScenarioActions scenarioId={id} scenarioName={scenario.name} />
          </div>
        </div>

        {/* 基本情報カード */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">年齢範囲</div>
            <div className="text-2xl font-bold text-gray-900">
              {scenario.current_age}歳 → {scenario.target_age}歳
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {scenario.target_age - scenario.current_age}年間
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">インフレ率</div>
            <div className="text-2xl font-bold text-gray-900">
              {scenario.inflation_rate}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              年間の物価上昇率
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">ステータス</div>
            <div className="text-2xl font-bold text-gray-900">
              {scenario.is_active ? (
                <span className="text-green-600">アクティブ</span>
              ) : (
                <span className="text-gray-400">非アクティブ</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              最終更新: {new Date(scenario.updated_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            次のステップ
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/scenarios/${id}/income`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900 mb-1">収入設定</h3>
              <p className="text-sm text-gray-600">給与やボーナスを入力</p>
            </Link>

            <Link
              href={`/scenarios/${id}/expense`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">💸</div>
              <h3 className="font-semibold text-gray-900 mb-1">支出設定</h3>
              <p className="text-sm text-gray-600">生活費や固定費を入力</p>
            </Link>

            <Link
              href={`/scenarios/${id}/events`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="font-semibold text-gray-900 mb-1">ライフイベント</h3>
              <p className="text-sm text-gray-600">結婚、出産、住宅購入など</p>
            </Link>

            <Link
              href={`/scenarios/${id}/investment`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-gray-900 mb-1">資産運用</h3>
              <p className="text-sm text-gray-600">運用利回りや積立額</p>
            </Link>
          </div>
        </div>

        {/* サマリー（将来実装） */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            シミュレーション結果
          </h2>
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>シミュレーション機能は今後実装予定です</p>
          </div>
        </div>
      </div>
    </ScenarioLayout>
  );
}
