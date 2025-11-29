import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';

export default async function ScenariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">シナリオ一覧</h1>
            <p className="mt-2 text-gray-600">作成したシナリオを管理します</p>
          </div>
          <Link
            href="/scenarios/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            ➕ 新規作成
          </Link>
        </div>

        {/* シナリオ一覧 */}
        {!scenarios || scenarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              シナリオがまだありません
            </h2>
            <p className="text-gray-600 mb-6">
              新規シナリオを作成してライフプランシミュレーションを開始しましょう
            </p>
            <Link
              href="/scenarios/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              最初のシナリオを作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg truncate">
                    {scenario.name}
                  </h3>
                  {scenario.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {scenario.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">年齢:</span>
                      <span>{scenario.current_age}歳 → {scenario.target_age}歳</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">インフレ率:</span>
                      <span>{scenario.inflation_rate}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>更新:</span>
                      <span>{new Date(scenario.updated_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex gap-2">
                  <Link
                    href={`/scenarios/${scenario.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    詳細
                  </Link>
                  <Link
                    href={`/scenarios/${scenario.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    編集
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
