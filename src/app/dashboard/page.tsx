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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近のシナリオ</h2>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-500 text-center py-8">
              まだシナリオがありません。新規シナリオを作成してください。
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
