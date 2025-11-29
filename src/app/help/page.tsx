import { MainLayout } from '@/components/MainLayout';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ヘルプ</h1>
          <p className="mt-2 text-gray-600">使い方とよくある質問</p>
        </div>

        {/* はじめに */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">はじめに</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-gray-700">
              ライフプランシミュレーションは、将来の収支や資産状況を可視化し、
              計画的な資産形成をサポートするWebアプリケーションです。
            </p>
            <p className="text-gray-700">
              複数のシナリオを作成・比較することで、最適なライフプランを検討できます。
            </p>
          </div>
        </div>

        {/* 基本的な使い方 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">基本的な使い方</h2>
          </div>
          <div className="px-6 py-4">
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>シナリオを作成</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  ダッシュボードまたはシナリオ管理画面から新規シナリオを作成します
                </p>
              </li>
              <li className="text-gray-700">
                <strong>基本情報を入力</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  現在の年齢、シミュレーション期間、インフレ率などを設定します
                </p>
              </li>
              <li className="text-gray-700">
                <strong>収入・支出を登録</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  月次の収入と支出を項目ごとに入力します
                </p>
              </li>
              <li className="text-gray-700">
                <strong>ライフイベントを追加</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  結婚、住宅購入、教育費などのライフイベントを登録します
                </p>
              </li>
              <li className="text-gray-700">
                <strong>資産運用を設定</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  初期資産額、月次積立額、想定利回りを設定します
                </p>
              </li>
              <li className="text-gray-700">
                <strong>シミュレーション結果を確認</strong>
                <p className="ml-6 mt-1 text-gray-600">
                  グラフやチャートで将来の資産推移を確認します
                </p>
              </li>
            </ol>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">よくある質問</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. シナリオはいくつまで作成できますか？
              </h3>
              <p className="text-gray-600 ml-4">
                A. シナリオ数に制限はありません。複数のシナリオを作成して比較できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. データは自動保存されますか？
              </h3>
              <p className="text-gray-600 ml-4">
                A. はい、入力したデータは自動的にクラウドに保存されます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Q. 複数のデバイスで利用できますか？
              </h3>
              <p className="text-gray-600 ml-4">
                A. はい、同じアカウントでログインすれば、どのデバイスからでもアクセスできます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
