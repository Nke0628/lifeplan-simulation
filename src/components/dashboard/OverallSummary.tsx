import type { SimulationResult } from '@/types/simulation';

interface OverallSummaryProps {
  scenariosCount: number;
  simulationResults: (SimulationResult | null)[];
}

export function OverallSummary({
  scenariosCount,
  simulationResults,
}: OverallSummaryProps) {
  // 有効なシミュレーション結果のみフィルタ
  const validResults = simulationResults.filter((r): r is SimulationResult => r !== null);

  if (validResults.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">概要</h2>
        <p className="text-gray-600">
          シナリオに収入・支出を設定すると、ここに概要が表示されます。
        </p>
      </div>
    );
  }

  // 警告が必要なシナリオ数
  const warningCount = validResults.filter(
    (r) => r.summary.bankruptAge !== null
  ).length;

  // 平均最終資産
  const avgFinalAsset =
    validResults.reduce((sum, r) => sum + r.summary.finalAsset, 0) /
    validResults.length;

  // 最も良いシナリオ
  const bestScenario = validResults.reduce((best, current) =>
    current.summary.finalAsset > best.summary.finalAsset ? current : best
  );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">概要</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* シナリオ数 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">作成済みシナリオ</p>
          <p className="text-2xl font-bold text-gray-900">{scenariosCount}</p>
        </div>

        {/* 平均最終資産 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">平均最終資産</p>
          <p className="text-2xl font-bold text-gray-900">
            {avgFinalAsset >= 10000
              ? `${(avgFinalAsset / 10000).toFixed(0)}万円`
              : `${avgFinalAsset.toFixed(0)}円`}
          </p>
        </div>

        {/* 最高資産シナリオ */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">最高最終資産</p>
          <p className="text-2xl font-bold text-green-600">
            {bestScenario.summary.finalAsset >= 10000
              ? `${(bestScenario.summary.finalAsset / 10000).toFixed(0)}万円`
              : `${bestScenario.summary.finalAsset.toFixed(0)}円`}
          </p>
        </div>

        {/* 警告数 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">要注意シナリオ</p>
          <p
            className={`text-2xl font-bold ${
              warningCount > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {warningCount}
          </p>
          {warningCount > 0 && (
            <p className="text-xs text-red-600 mt-1">資産が底をつく可能性</p>
          )}
        </div>
      </div>

      {/* アドバイス */}
      {warningCount > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ {warningCount}
            件のシナリオで資産が底をつく可能性があります。収入を増やすか、支出を見直すことをお勧めします。
          </p>
        </div>
      )}
    </div>
  );
}
