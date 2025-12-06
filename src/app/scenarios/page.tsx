import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { ScenarioCard } from '@/components/ScenarioCard';
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
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              シナリオ一覧
            </h1>
            <p className="text-lg text-gray-600">作成したシナリオを管理します</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/scenarios/compare"
              className="inline-flex items-center gap-2 px-5 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              シナリオ比較
            </Link>
            <Link
              href="/scenarios/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </Link>
          </div>
        </div>

        {/* シナリオ一覧 */}
        {!scenarios || scenarios.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md border border-gray-200 p-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary-100 rounded-full p-6">
                  <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                シナリオがまだありません
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                新規シナリオを作成してライフプランシミュレーションを開始しましょう
              </p>
              <Link
                href="/scenarios/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                最初のシナリオを作成
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
