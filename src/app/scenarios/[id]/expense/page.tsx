"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ScenarioLayout } from "@/components/ScenarioLayout";
import { ExpenseItemForm } from "@/components/ExpenseItemForm";
import { Button, Card } from "@/components/ui";
import { Plus, CreditCard, Calendar, ListChecks, Minus } from "lucide-react";
import type {
  ExpenseItem,
  CreateExpenseItemInput,
  ExpenseCategory,
  LifeStage,
} from "@/types/expense";

export default function ExpensePage() {
  const params = useParams();
  const scenarioId = params.id as string;

  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | undefined>();
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [filterLifeStage, setFilterLifeStage] = useState<LifeStage | "all">("all");

  useEffect(() => {
    fetchExpenseItems();
  }, [scenarioId]);

  const fetchExpenseItems = async () => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/expense`);
      if (response.ok) {
        const data = await response.json();
        setExpenseItems(data);
      }
    } catch (error) {
      console.error("Error fetching expense items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (input: CreateExpenseItemInput) => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        await fetchExpenseItems();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating expense item:", error);
    }
  };

  const handleUpdate = async (item: ExpenseItem | CreateExpenseItemInput) => {
    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/expense/${(item as ExpenseItem).id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );

      if (response.ok) {
        await fetchExpenseItems();
        setEditingItem(undefined);
      }
    } catch (error) {
      console.error("Error updating expense item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この支出項目を削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/expense/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchExpenseItems();
      }
    } catch (error) {
      console.error("Error deleting expense item:", error);
    }
  };

  const filteredItems = expenseItems.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) {
      return false;
    }
    if (filterLifeStage !== "all" && item.life_stage !== filterLifeStage) {
      return false;
    }
    return true;
  });

  const totalMonthly = filteredItems.reduce(
    (sum, item) => sum + item.monthly_amount,
    0
  );
  const totalAnnual = totalMonthly * 12;

  if (loading) {
    return (
      <ScenarioLayout scenarioId={scenarioId}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* ヘッダー スケルトン */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-9 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>

            {/* サマリーカード スケルトン */}
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>

            {/* テーブル スケルトン */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="h-10 bg-gray-200 rounded w-40"></div>
                  <div className="h-10 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-6 flex items-center gap-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-40 flex-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScenarioLayout>
    );
  }

  return (
    <ScenarioLayout scenarioId={scenarioId}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              支出管理
            </h1>
            <p className="text-lg text-gray-600">月次ベースの支出項目を管理</p>
          </div>
          <Button
            onClick={() => {
              setEditingItem(undefined);
              setShowForm(true);
            }}
            variant="primary"
            icon={Plus}
            size="lg"
          >
            新規追加
          </Button>
        </div>

        {/* フォーム */}
        {showForm && (
          <Card variant="elevated" padding="lg" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="text-primary-600" size={28} />
              新規支出項目
            </h2>
            <ExpenseItemForm
              scenarioId={scenarioId}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        )}

        {editingItem && (
          <Card variant="elevated" padding="lg" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Minus className="text-error-600" size={28} />
              支出項目の編集
            </h2>
            <ExpenseItemForm
              scenarioId={scenarioId}
              item={editingItem}
              onSave={handleUpdate}
              onCancel={() => setEditingItem(undefined)}
            />
          </Card>
        )}

        {/* サマリー */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <Card variant="gradient" padding="lg" className="bg-gradient-to-br from-error-50 to-error-100 border-error-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-error-500 rounded-lg p-2.5">
                <Calendar className="text-white" size={24} />
              </div>
              <p className="text-sm font-semibold text-error-700">月間支出合計</p>
            </div>
            <p className="text-3xl font-bold text-error-900">
              ¥{totalMonthly.toLocaleString()}
            </p>
          </Card>
          <Card variant="gradient" padding="lg" className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-warning-500 rounded-lg p-2.5">
                <CreditCard className="text-white" size={24} />
              </div>
              <p className="text-sm font-semibold text-warning-700">年間支出合計</p>
            </div>
            <p className="text-3xl font-bold text-warning-900">
              ¥{totalAnnual.toLocaleString()}
            </p>
          </Card>
          <Card variant="gradient" padding="lg" className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-secondary-500 rounded-lg p-2.5">
                <ListChecks className="text-white" size={24} />
              </div>
              <p className="text-sm font-semibold text-secondary-700">支出項目数</p>
            </div>
            <p className="text-3xl font-bold text-secondary-900">
              {filteredItems.length}件
            </p>
          </Card>
        </div>

        {/* フィルター */}
        <div className="mb-4 flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="生活費">生活費</option>
            <option value="住居費">住居費</option>
            <option value="娯楽費">娯楽費</option>
            <option value="交通費">交通費</option>
            <option value="保険料">保険料</option>
            <option value="その他">その他</option>
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

        {/* 支出項目一覧 */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-error-100 rounded-full p-6">
                  <CreditCard className="text-error-600" size={48} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                支出項目がありません
              </h3>
              <p className="text-gray-600 mb-6">
                新規追加ボタンから支出項目を追加してください
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
                      月額
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ¥{item.monthly_amount.toLocaleString()}
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
