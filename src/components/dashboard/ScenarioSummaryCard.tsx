import Link from 'next/link';
import type { Scenario } from '@/types/scenario';
import type { SimulationResult } from '@/types/simulation';

interface ScenarioSummaryCardProps {
  scenario: Scenario;
  simulationResult: SimulationResult | null;
}

export function ScenarioSummaryCard({
  scenario,
  simulationResult,
}: ScenarioSummaryCardProps) {
  // 現在年齢から10年後、20年後、退職時（65歳）の資産額を取得
  const get10YearsLater = () => {
    if (!simulationResult) return null;
    const targetAge = scenario.current_age + 10;
    return simulationResult.years.find((y) => y.age === targetAge)?.asset;
  };

  const get20YearsLater = () => {
    if (!simulationResult) return null;
    const targetAge = scenario.current_age + 20;
    return simulationResult.years.find((y) => y.age === targetAge)?.asset;
  };

  const getRetirementAsset = () => {
    if (!simulationResult) return null;
    const retirementAge = 65;
    return simulationResult.years.find((y) => y.age === retirementAge)?.asset;
  };

  const asset10Years = get10YearsLater();
  const asset20Years = get20YearsLater();
  const retirementAsset = getRetirementAsset();

  // 収支バランスの判定
  const getBalanceStatus = () => {
    if (!simulationResult) return null;
    const { finalAsset, bankruptAge } = simulationResult.summary;

    if (bankruptAge !== null) {
      return { status: 'danger', label: '警告', message: `${bankruptAge}歳で資産が底をつきます` };
    }

    if (finalAsset < 0) {
      return { status: 'danger', label: '赤字', message: '最終的に赤字になります' };
    }

    if (finalAsset < 10000000) {
      return { status: 'warning', label: '注意', message: '資産残高が少なめです' };
    }

    return { status: 'success', label: '良好', message: '収支バランスは良好です' };
  };

  const balanceStatus = getBalanceStatus();

  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
    >
      {/* シナリオ名と説明 */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate text-lg">
          {scenario.name}
        </h3>
        {scenario.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {scenario.description}
          </p>
        )}
      </div>

      {/* サマリー情報 */}
      {simulationResult ? (
        <div className="space-y-3">
          {/* 収支バランス */}
          {balanceStatus && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  balanceStatus.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : balanceStatus.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {balanceStatus.label}
              </span>
              <span className="text-sm text-gray-600">{balanceStatus.message}</span>
            </div>
          )}

          {/* 資産予測 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {asset10Years !== null && asset10Years !== undefined && (
              <div>
                <p className="text-gray-500">10年後</p>
                <p className="font-semibold text-gray-900">
                  {asset10Years.toLocaleString()}円
                </p>
              </div>
            )}
            {asset20Years !== null && asset20Years !== undefined && (
              <div>
                <p className="text-gray-500">20年後</p>
                <p className="font-semibold text-gray-900">
                  {asset20Years.toLocaleString()}円
                </p>
              </div>
            )}
            {retirementAsset !== null && retirementAsset !== undefined && (
              <div>
                <p className="text-gray-500">退職時(65歳)</p>
                <p className="font-semibold text-gray-900">
                  {retirementAsset.toLocaleString()}円
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500">最終資産</p>
              <p className="font-semibold text-gray-900">
                {simulationResult.summary.finalAsset.toLocaleString()}円
              </p>
            </div>
          </div>

          {/* ピーク情報 */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              資産ピーク: {simulationResult.summary.peakAge}歳時点で{' '}
              {simulationResult.summary.peakAsset.toLocaleString()}円
            </p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          <p>シミュレーション結果がありません</p>
          <p className="text-xs mt-1">収入・支出を設定してください</p>
        </div>
      )}

      {/* 基本情報 */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        <p>年齢: {scenario.current_age}歳 → {scenario.target_age}歳</p>
        <p>更新: {new Date(scenario.updated_at).toLocaleDateString('ja-JP')}</p>
      </div>
    </Link>
  );
}
