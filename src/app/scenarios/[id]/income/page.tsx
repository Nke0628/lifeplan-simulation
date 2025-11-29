"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScenarioLayout } from "@/components/ScenarioLayout";
import { IncomeItemForm } from "@/components/IncomeItemForm";
import { calculateAnnualIncome } from "@/types/income";
import type {
  IncomeItem,
  CreateIncomeItemInput,
  IncomeCategory,
  LifeStage,
} from "@/types/income";

export default function IncomePage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.id as string;

  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | undefined>();
  const [filterCategory, setFilterCategory] = useState<IncomeCategory | "all">("all");
  const [filterLifeStage, setFilterLifeStage] = useState<LifeStage | "all">("all");

  useEffect(() => {
    fetchIncomeItems();
  }, [scenarioId]);

  const fetchIncomeItems = async () => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/income`);
      if (response.ok) {
        const data = await response.json();
        setIncomeItems(data);
      }
    } catch (error) {
      console.error("Error fetching income items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (input: CreateIncomeItemInput) => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        await fetchIncomeItems();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating income item:", error);
    }
  };

  const handleUpdate = async (item: IncomeItem | CreateIncomeItemInput) => {
    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/income/${(item as IncomeItem).id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );

      if (response.ok) {
        await fetchIncomeItems();
        setEditingItem(undefined);
      }
    } catch (error) {
      console.error("Error updating income item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この収入項目を削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/income/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchIncomeItems();
      }
    } catch (error) {
      console.error("Error deleting income item:", error);
    }
  };

  const filteredItems = incomeItems.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) {
      return false;
    }
    if (filterLifeStage !== "all" && item.life_stage !== filterLifeStage) {
      return false;
    }
    return true;
  });

  const totalAnnual = filteredItems.reduce(
    (sum, item) => sum + calculateAnnualIncome(item),
    0
  );
  const totalMonthly = totalAnnual / 12;

  if (loading) {
    return (
      <ScenarioLayout scenarioId={scenarioId}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </ScenarioLayout>
    );
  }

  return (
    <ScenarioLayout scenarioId={scenarioId}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">収入管理</h1>
            <p className="mt-2 text-gray-600">月次ベースの収入項目を管理</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(undefined);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ➕ 新規追加
          </button>
        </div>

        {/* フォーム */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              新規収入項目
            </h2>
            <IncomeItemForm
              scenarioId={scenarioId}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {editingItem && (
          <div className="mb-8 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              収入項目の編集
            </h2>
            <IncomeItemForm
              scenarioId={scenarioId}
              item={editingItem}
              onSave={handleUpdate}
              onCancel={() => setEditingItem(undefined)}
            />
          </div>
        )}

        {/* サマリー */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <p className="text-sm text-gray-600">月間収入合計</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{totalMonthly.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <p className="text-sm text-gray-600">年間収入合計</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{totalAnnual.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <p className="text-sm text-gray-600">収入項目数</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredItems.length}件
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-4 flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as IncomeCategory | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="給与">給与</option>
            <option value="ボーナス">ボーナス</option>
            <option value="その他収入">その他収入</option>
          </select>

          <select
            value={filterLifeStage}
            onChange={(e) => setFilterLifeStage(e.target.value as LifeStage | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのライフステージ</option>
            <option value="現役時代">現役時代</option>
            <option value="退職後">退職後</option>
          </select>
        </div>

        {/* 収入項目一覧 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                収入項目がありません
              </h3>
              <p className="text-gray-600 mb-6">
                新規追加ボタンから収入項目を追加してください
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      項目名
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期間
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ライフステージ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.category === "ボーナス" && item.bonus_times_per_year > 0 ? (
                          <div>
                            <div className="font-medium">
                              年{item.bonus_times_per_year}回 × ¥{item.bonus_amount_per_time.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              年間 ¥{(item.bonus_times_per_year * item.bonus_amount_per_time).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">
                              ¥{item.monthly_amount.toLocaleString()}/月
                            </div>
                            <div className="text-xs text-gray-500">
                              年間 ¥{(item.monthly_amount * 12).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {item.start_age}歳 〜{" "}
                        {item.end_age ? `${item.end_age}歳` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {item.life_stage || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ScenarioLayout>
  );
}
