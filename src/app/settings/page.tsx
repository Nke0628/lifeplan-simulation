import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">設定</h1>
          <p className="mt-2 text-gray-600">アカウント情報と設定の管理</p>
        </div>

        {/* アカウント情報 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">アカウント情報</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザーID
              </label>
              <p className="text-gray-500 text-sm font-mono">{user.id}</p>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">表示設定</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-500">表示設定は今後のアップデートで追加予定です</p>
          </div>
        </div>

        {/* データ管理 */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">データ管理</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-500">データのエクスポート機能は今後のアップデートで追加予定です</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
