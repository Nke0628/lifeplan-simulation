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

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">シナリオ管理</h1>
            <p className="mt-2 text-gray-600">作成したシナリオの一覧と管理</p>
          </div>
          <Link
            href="/scenarios/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            新規作成
          </Link>
        </div>

        {/* シナリオ一覧 */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              シナリオがありません
            </h3>
            <p className="text-gray-600 mb-6">
              新しいシナリオを作成して、ライフプランシミュレーションを開始しましょう
            </p>
            <Link
              href="/scenarios/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              最初のシナリオを作成
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
