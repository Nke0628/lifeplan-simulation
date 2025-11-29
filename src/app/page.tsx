import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン済みの場合はダッシュボードへリダイレクト
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ライフプランシミュレーション
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            将来の収支や資産状況を可視化し、計画的な資産形成をサポート
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/help"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              使い方を見る
            </Link>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">収支の可視化</h3>
            <p className="text-gray-600">
              将来の収支を可視化し、計画的な資産形成をサポートします
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">シナリオ比較</h3>
            <p className="text-gray-600">
              複数のシナリオを比較することで、最適な選択肢を検討できます
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">ライフイベント</h3>
            <p className="text-gray-600">
              結婚、出産、住宅購入などのライフイベントを考慮したシミュレーション
            </p>
          </div>
        </div>

        {/* 主な機能 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">主な機能</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <div>
                  <strong className="text-gray-900">基本的な収支計算</strong>
                  <p className="text-gray-600">
                    月次ベースでの収入・支出の入力と自動集計
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <div>
                  <strong className="text-gray-900">ライフイベント管理</strong>
                  <p className="text-gray-600">
                    住宅購入、結婚、教育、車購入などのイベント登録
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <div>
                  <strong className="text-gray-900">資産運用シミュレーション</strong>
                  <p className="text-gray-600">
                    複利計算による資産形成のシミュレーション
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <div>
                  <strong className="text-gray-900">データ可視化</strong>
                  <p className="text-gray-600">
                    グラフやチャートによる分かりやすい可視化
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
