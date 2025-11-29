import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';

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
    .limit(3);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">ようこそ、{user.email} さん</p>
        </div>

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
            {scenarios && scenarios.length > 0 && (
              <Link
                href="/scenarios"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る →
              </Link>
            )}
          </div>

          {!scenarios || scenarios.length === 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <p className="text-gray-500 text-center py-8">
                まだシナリオがありません。新規シナリオを作成してください。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {scenario.name}
                  </h3>
                  {scenario.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {scenario.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>年齢: {scenario.current_age}歳 → {scenario.target_age}歳</p>
                    <p>インフレ率: {scenario.inflation_rate}%</p>
                    <p className="text-xs text-gray-400">
                      更新: {new Date(scenario.updated_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
