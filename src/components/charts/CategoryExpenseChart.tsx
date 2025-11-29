'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryExpenseChartProps {
  expenseData: {
    category: string;
    amount: number;
  }[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export function CategoryExpenseChart({ expenseData }: CategoryExpenseChartProps) {
  // 金額が0より大きいカテゴリのみフィルター
  const validData = expenseData.filter((item) => item.amount > 0);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        支出データがありません
      </div>
    );
  }

  // 合計金額を計算
  const total = validData.reduce((sum, item) => sum + item.amount, 0);

  // パーセンテージを計算したデータ
  const dataWithPercentage = validData.map((item) => ({
    ...item,
    percentage: ((item.amount / total) * 100).toFixed(1),
  }));

  // カスタムラベル
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="amount"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString()}円`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const item = dataWithPercentage.find((d) => d.category === value);
              return `${value} (${item?.percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* カテゴリ別詳細テーブル */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                割合
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dataWithPercentage.map((item, index) => (
              <tr key={item.category}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {item.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {item.amount.toLocaleString()}円
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {item.percentage}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                合計
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                {total.toLocaleString()}円
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
