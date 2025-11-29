'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ScenarioSelector } from '@/components/compare/ScenarioSelector';
import { ComparisonChart } from '@/components/compare/ComparisonChart';
import { ComparisonTable } from '@/components/compare/ComparisonTable';
import type { Scenario } from '@/types/scenario';
import type { SimulationResult } from '@/types/simulation';

interface ScenarioWithResult {
  scenario: Scenario;
  result: SimulationResult;
}

export default function ComparePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ScenarioWithResult[]>([]);
  const [loading, setLoading] = useState(false);

  // シナリオ一覧を取得
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await fetch('/api/scenarios');
        if (response.ok) {
          const data = await response.json();
          setScenarios(data);
        }
      } catch (error) {
        console.error('Failed to fetch scenarios:', error);
      }
    }
    fetchScenarios();
  }, []);

  // 選択されたシナリオのシミュレーションを実行
  useEffect(() => {
    async function runComparison() {
      if (selectedIds.length === 0) {
        setComparisonData([]);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          selectedIds.map(async (id) => {
            const scenario = scenarios.find((s) => s.id === id);
            if (!scenario) return null;

            const response = await fetch(`/api/scenarios/${id}/simulate`);
            if (!response.ok) return null;

            const result = await response.json();
            return { scenario, result };
          })
        );

        setComparisonData(results.filter((r): r is ScenarioWithResult => r !== null));
      } catch (error) {
        console.error('Failed to run comparison:', error);
      } finally {
        setLoading(false);
      }
    }

    runComparison();
  }, [selectedIds, scenarios]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">シナリオ比較</h1>
          <p className="mt-2 text-gray-600">
            最大3つのシナリオを比較して、最適な選択肢を検討できます
          </p>
        </div>

        {/* シナリオ選択 */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          maxSelection={3}
        />

        {/* 比較結果 */}
        {loading ? (
          <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">シミュレーションを実行中...</p>
          </div>
        ) : comparisonData.length === 0 ? (
          <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              シナリオを選択してください
            </h2>
            <p className="text-gray-600">
              比較したいシナリオを最大3つまで選択できます
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* 比較グラフ */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                資産推移の比較
              </h2>
              <ComparisonChart data={comparisonData} />
            </div>

            {/* 比較テーブル */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                主要指標の比較
              </h2>
              <ComparisonTable data={comparisonData} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
