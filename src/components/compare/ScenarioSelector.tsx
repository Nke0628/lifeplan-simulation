'use client';

import type { Scenario } from '@/types/scenario';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection: number;
}

export function ScenarioSelector({
  scenarios,
  selectedIds,
  onSelectionChange,
  maxSelection,
}: ScenarioSelectorProps) {
  const handleToggle = (scenarioId: string) => {
    if (selectedIds.includes(scenarioId)) {
      // 選択解除
      onSelectionChange(selectedIds.filter((id) => id !== scenarioId));
    } else {
      // 選択追加（最大数チェック）
      if (selectedIds.length < maxSelection) {
        onSelectionChange([...selectedIds, scenarioId]);
      }
    }
  };

  if (scenarios.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">
              シナリオがありません
            </h3>
            <p className="mt-1 text-yellow-700">
              比較するには、まず<a href="/scenarios/new" className="underline">シナリオを作成</a>してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          比較するシナリオを選択
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {selectedIds.length} / {maxSelection} 選択中
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const isSelected = selectedIds.includes(scenario.id);
          const isDisabled = !isSelected && selectedIds.length >= maxSelection;
          const selectionIndex = selectedIds.indexOf(scenario.id);
          const color = getColor(selectionIndex);

          return (
            <button
              key={scenario.id}
              onClick={() => handleToggle(scenario.id)}
              disabled={isDisabled}
              className={`
                relative text-left p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `${color.border} ${color.bg} shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* 選択インジケーター */}
              {isSelected && (
                <div className={`absolute top-2 right-2 w-8 h-8 rounded-full ${color.badge} flex items-center justify-center text-white font-bold text-sm`}>
                  {selectionIndex + 1}
                </div>
              )}

              <h3 className="font-semibold text-gray-900 pr-10">
                {scenario.name}
              </h3>
              {scenario.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {scenario.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>年齢: {scenario.current_age}歳</span>
                <span>〜 {scenario.target_age}歳</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// シナリオ選択順に色を割り当て
function getColor(index: number) {
  const colors = [
    {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      badge: 'bg-blue-500',
      chart: '#3B82F6',
    },
    {
      border: 'border-green-500',
      bg: 'bg-green-50',
      badge: 'bg-green-500',
      chart: '#10B981',
    },
    {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      badge: 'bg-orange-500',
      chart: '#F59E0B',
    },
    {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      badge: 'bg-purple-500',
      chart: '#8B5CF6',
    },
    {
      border: 'border-pink-500',
      bg: 'bg-pink-50',
      badge: 'bg-pink-500',
      chart: '#EC4899',
    },
    {
      border: 'border-teal-500',
      bg: 'bg-teal-50',
      badge: 'bg-teal-500',
      chart: '#14B8A6',
    },
  ];
  return colors[index] || colors[0];
}

// 色情報をエクスポート（グラフで使用）
export function getChartColor(index: number): string {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
  return colors[index] || colors[0];
}
