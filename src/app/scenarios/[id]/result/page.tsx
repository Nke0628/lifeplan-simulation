"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ScenarioLayout } from "@/components/ScenarioLayout";
import type { SimulationResult } from "@/types/simulation";
import type { ExpenseItem } from "@/types/expense";
import type { LifeEvent } from "@/types/lifeEvent";
import type { Scenario } from "@/types/scenario";

// グラフコンポーネントを動的にインポート（コード分割）
const CategoryExpenseChart = dynamic(
  () => import("@/components/charts/CategoryExpenseChart").then((mod) => ({ default: mod.CategoryExpenseChart })),
  {
    loading: () => <div className="h-96 flex items-center justify-center text-gray-500">グラフを読み込み中...</div>,
    ssr: false
  }
);

const LifeEventTimeline = dynamic(
  () => import("@/components/charts/LifeEventTimeline").then((mod) => ({ default: mod.LifeEventTimeline })),
  {
    loading: () => <div className="h-48 flex items-center justify-center text-gray-500">タイムラインを読み込み中...</div>,
    ssr: false
  }
);

// Rechartsコンポーネントは通常のimportに戻す（dynamic importが複雑になるため）
// CategoryExpenseChartとLifeEventTimelineがdynamic importされているので十分効果あり
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setScenarioId(resolvedParams.id);
    });
  }, [params]);

  const fetchAllData = useCallback(async () => {
    if (!scenarioId) return;

    try {
      // 並列でデータを取得
      const [simulationRes, scenarioRes, expensesRes, eventsRes] = await Promise.all([
        fetch(`/api/scenarios/${scenarioId}/simulate`),
        fetch(`/api/scenarios/${scenarioId}`),
        fetch(`/api/scenarios/${scenarioId}/expense`),
        fetch(`/api/scenarios/${scenarioId}/events`),
      ]);

      if (!simulationRes.ok) {
        throw new Error("シミュレーションの実行に失敗しました");
      }

      const [simulationData, scenarioData, expensesData, eventsData] = await Promise.all([
        simulationRes.json(),
        scenarioRes.ok ? scenarioRes.json() : null,
        expensesRes.ok ? expensesRes.json() : [],
        eventsRes.ok ? eventsRes.json() : [],
      ]);

      setResult(simulationData);
      setScenario(scenarioData);
      setExpenseItems(expensesData);
      setLifeEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    if (scenarioId) {
      fetchAllData();
    }
  }, [scenarioId, fetchAllData]);

  const fetchSimulation = useCallback(async () => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/simulate`);
      if (!response.ok) {
        throw new Error("シミュレーションの実行に失敗しました");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }, [scenarioId]);

  const handleDuplicate = useCallback(async () => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("シナリオの複製に失敗しました");
      }

      const duplicatedScenario = await response.json();
      // 複製したシナリオの編集画面に遷移
      window.location.href = `/scenarios/${duplicatedScenario.id}/edit`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }, [scenarioId]);

  const handleAddToCompare = useCallback(() => {
    if (!scenarioId) return;
    // 比較画面に遷移（URLパラメータでシナリオIDを渡す）
    window.location.href = `/scenarios/compare?selected=${scenarioId}`;
  }, [scenarioId]);

  if (loading) {
    return (
      <ScenarioLayout scenarioId={scenarioId || ""}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </ScenarioLayout>
    );
  }

  if (error || !result) {
    return (
      <ScenarioLayout scenarioId={scenarioId || ""}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error || "データの読み込みに失敗しました"}</p>
          <button
            onClick={fetchSimulation}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </ScenarioLayout>
    );
  }

  const { years, summary } = result;

  // グラフ用データの準備（5年ごと） - メモ化
  const chartData = useMemo(() => {
    return years.filter((_, index) => index % 5 === 0 || index === years.length - 1);
  }, [years]);

  // カテゴリ別支出データの準備 - メモ化
  const categoryExpenseData = useMemo(() => {
    return Object.entries(
      expenseItems.reduce((acc, item) => {
        const category = item.category || 'その他';
        acc[category] = (acc[category] || 0) + item.monthly_amount * 12;
        return acc;
      }, {} as Record<string, number>)
    ).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenseItems]);

  return (
    <ScenarioLayout scenarioId={scenarioId || ""}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">シミュレーション結果</h1>
            <p className="text-gray-600 mt-1">
              {years[0]?.age}歳 〜 {years[years.length - 1]?.age}歳までの推移
            </p>
          </div>
          <button
            onClick={fetchSimulation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            🔄 再計算
          </button>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`/scenarios/${scenarioId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            ✏️ 編集に戻る
          </a>
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            📋 シナリオを複製
          </button>
          <button
            onClick={handleAddToCompare}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            🔄 比較に追加
          </button>
        </div>

        {/* 警告表示 */}
        {summary.bankruptAge && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  資産枯渇の警告
                </h3>
                <p className="text-red-700">
                  <strong>{summary.bankruptAge}歳</strong>
                  で資産が底をつく可能性があります。収入を増やすか、支出を減らすことを検討してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-sm text-blue-700 mb-1">総収入</div>
            <div className="text-2xl font-bold text-blue-900">
              {summary.totalIncome.toLocaleString()}円
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="text-sm text-red-700 mb-1">総支出</div>
            <div className="text-2xl font-bold text-red-900">
              {summary.totalExpense.toLocaleString()}円
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-sm text-purple-700 mb-1">イベント費用</div>
            <div className="text-2xl font-bold text-purple-900">
              {summary.totalEvents.toLocaleString()}円
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-sm text-green-700 mb-1">最終資産額</div>
            <div className="text-2xl font-bold text-green-900">
              {summary.finalAsset.toLocaleString()}円
            </div>
          </div>
        </div>

        {/* ピーク資産情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">資産のピーク</h2>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-sm text-gray-600 mb-1">ピーク年齢</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.peakAge}歳
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">ピーク資産額</div>
              <div className="text-3xl font-bold text-blue-600">
                {summary.peakAsset.toLocaleString()}円
              </div>
            </div>
          </div>
        </div>

        {/* 資産推移グラフ */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">資産推移</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                label={{ value: "年齢", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "資産額（円）", angle: -90, position: "insideLeft" }}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}円`}
                labelFormatter={(label) => `${label}歳`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="asset"
                stroke="#3b82f6"
                strokeWidth={3}
                name="資産残高"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 収支推移グラフ */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">年次収支推移</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                label={{ value: "年齢", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "金額（円）", angle: -90, position: "insideLeft" }}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}円`}
                labelFormatter={(label) => `${label}歳`}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="収入" />
              <Bar dataKey="expense" fill="#ef4444" name="支出" />
              <Bar dataKey="events" fill="#8b5cf6" name="イベント" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* カテゴリ別支出グラフ */}
        {expenseItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              カテゴリ別支出内訳
            </h2>
            <CategoryExpenseChart expenseData={categoryExpenseData} />
          </div>
        )}

        {/* ライフイベントタイムライン */}
        {lifeEvents.length > 0 && scenario && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ライフイベントタイムライン
            </h2>
            <LifeEventTimeline
              lifeEvents={lifeEvents}
              currentAge={scenario.current_age}
              targetAge={scenario.target_age}
            />
          </div>
        )}

        {/* 詳細データテーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">年次詳細データ</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年齢
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    収入
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支出
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    イベント
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    収支
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    運用益
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    資産残高
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {years.map((yearData, index) => (
                  <tr
                    key={index}
                    className={
                      yearData.asset < 0
                        ? "bg-red-50"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {yearData.age}歳
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {yearData.year}年
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                      {yearData.income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      {yearData.expense.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 text-right">
                      {yearData.events.toLocaleString()}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        yearData.balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {yearData.balance >= 0 ? "+" : ""}
                      {yearData.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                      {yearData.investmentReturn >= 0 ? "+" : ""}
                      {yearData.investmentReturn.toLocaleString()}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        yearData.asset >= 0 ? "text-gray-900" : "text-red-600"
                      }`}
                    >
                      {yearData.asset.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ScenarioLayout>
  );
}
