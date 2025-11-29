'use client';

import type { Scenario } from '@/types/scenario';
import type { SimulationResult } from '@/types/simulation';
import { getChartColor } from './ScenarioSelector';

interface ScenarioWithResult {
  scenario: Scenario;
  result: SimulationResult;
}

interface ComparisonTableProps {
  data: ScenarioWithResult[];
}

interface Metric {
  label: string;
  key: keyof SimulationResult['summary'];
  format: (value: number | null) => string;
  higherIsBetter: boolean; // 高い方が良い指標かどうか
}

const metrics: Metric[] = [
  {
    label: '最終資産額',
    key: 'finalAsset',
    format: (value) => (value !== null ? `${value.toLocaleString()}円` : '-'),
    higherIsBetter: true,
  },
  {
    label: '総収入',
    key: 'totalIncome',
    format: (value) => (value !== null ? `${value.toLocaleString()}円` : '-'),
    higherIsBetter: true,
  },
  {
    label: '総支出',
    key: 'totalExpense',
    format: (value) => (value !== null ? `${value.toLocaleString()}円` : '-'),
    higherIsBetter: false,
  },
  {
    label: 'ライフイベント費用',
    key: 'totalEvents',
    format: (value) => (value !== null ? `${value.toLocaleString()}円` : '-'),
    higherIsBetter: false,
  },
  {
    label: '資産のピーク',
    key: 'peakAsset',
    format: (value) => (value !== null ? `${value.toLocaleString()}円` : '-'),
    higherIsBetter: true,
  },
  {
    label: 'ピーク時の年齢',
    key: 'peakAge',
    format: (value) => (value !== null ? `${value}歳` : '-'),
    higherIsBetter: false, // 年齢は高低で判断しない
  },
  {
    label: '資産が底をつく年齢',
    key: 'bankruptAge',
    format: (value) => (value !== null ? `${value}歳` : 'なし'),
    higherIsBetter: false, // 底をつかないのが最良
  },
];

export function ComparisonTable({ data }: ComparisonTableProps) {
  if (data.length === 0) {
    return null;
  }

  // 各指標の最良値を計算（差分ハイライト用）
  const getBestValue = (metric: Metric): number | null => {
    const values = data
      .map((item) => item.result.summary[metric.key])
      .filter((v): v is number => v !== null);

    if (values.length === 0) return null;

    if (metric.key === 'bankruptAge') {
      // 破産年齢は「なし(null)」が最良
      return null;
    }

    if (metric.higherIsBetter) {
      return Math.max(...values);
    } else {
      return Math.min(...values);
    }
  };

  // 値が最良かどうかを判定
  const isBestValue = (
    value: number | null,
    metric: Metric,
    bestValue: number | null
  ): boolean => {
    if (metric.key === 'bankruptAge') {
      // 破産年齢は「なし(null)」が最良
      return value === null;
    }

    if (metric.key === 'peakAge') {
      // 年齢は優劣をつけない
      return false;
    }

    return value !== null && value === bestValue;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              指標
            </th>
            {data.map((item, index) => (
              <th
                key={item.scenario.id}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: getChartColor(index) }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getChartColor(index) }}
                  />
                  <span className="truncate max-w-[150px]">
                    {item.scenario.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric) => {
            const bestValue = getBestValue(metric);

            return (
              <tr key={metric.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {metric.label}
                </td>
                {data.map((item) => {
                  const value = item.result.summary[metric.key];
                  const isBest = isBestValue(value, metric, bestValue);

                  return (
                    <td
                      key={item.scenario.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isBest
                          ? 'font-bold text-green-700 bg-green-50'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{metric.format(value)}</span>
                        {isBest && <span className="text-green-600">✓</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 差分サマリー */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          差分サマリー
        </h3>
        <DifferenceSummary data={data} />
      </div>
    </div>
  );
}

// 差分サマリーコンポーネント
function DifferenceSummary({ data }: ComparisonTableProps) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-blue-700">
        2つ以上のシナリオを選択すると差分が表示されます。
      </p>
    );
  }

  const baseScenario = data[0];
  const comparisons = data.slice(1);

  return (
    <div className="space-y-3">
      {comparisons.map((comparison, index) => {
        const assetDiff =
          comparison.result.summary.finalAsset -
          baseScenario.result.summary.finalAsset;
        const incomeDiff =
          comparison.result.summary.totalIncome -
          baseScenario.result.summary.totalIncome;
        const expenseDiff =
          comparison.result.summary.totalExpense -
          baseScenario.result.summary.totalExpense;

        return (
          <div
            key={comparison.scenario.id}
            className="text-sm text-blue-700"
          >
            <p className="font-semibold mb-1">
              「{baseScenario.scenario.name}」と「{comparison.scenario.name}」の比較:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                最終資産額の差:{' '}
                <span
                  className={`font-semibold ${
                    assetDiff > 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {assetDiff > 0 ? '+' : ''}
                  {assetDiff.toLocaleString()}円
                </span>
              </li>
              <li>
                総収入の差:{' '}
                <span className="font-semibold">
                  {incomeDiff > 0 ? '+' : ''}
                  {incomeDiff.toLocaleString()}円
                </span>
              </li>
              <li>
                総支出の差:{' '}
                <span className="font-semibold">
                  {expenseDiff > 0 ? '+' : ''}
                  {expenseDiff.toLocaleString()}円
                </span>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}
