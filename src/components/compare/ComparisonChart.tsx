'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Scenario } from '@/types/scenario';
import type { SimulationResult } from '@/types/simulation';
import { getChartColor } from './ScenarioSelector';

interface ScenarioWithResult {
  scenario: Scenario;
  result: SimulationResult;
}

interface ComparisonChartProps {
  data: ScenarioWithResult[];
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  if (data.length === 0) {
    return null;
  }

  // グラフデータを整形
  const chartData = prepareChartData(data);

  // Y軸のフォーマッター（万円単位）
  const formatYAxis = (value: number) => {
    return `${(value / 10000).toFixed(0)}万`;
  };

  // ツールチップのフォーマッター
  const formatTooltip = (value: number) => {
    return `${value.toLocaleString()}円`;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="age"
            label={{ value: '年齢', position: 'insideBottom', offset: -5 }}
            stroke="#6B7280"
          />
          <YAxis
            tickFormatter={formatYAxis}
            label={{ value: '資産額', angle: -90, position: 'insideLeft' }}
            stroke="#6B7280"
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {data.map((item, index) => (
            <Line
              key={item.scenario.id}
              type="monotone"
              dataKey={`scenario_${index}`}
              name={item.scenario.name}
              stroke={getChartColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// チャートデータの準備
function prepareChartData(data: ScenarioWithResult[]) {
  if (data.length === 0) return [];

  // すべてのシナリオの年齢範囲を取得
  const allAges = new Set<number>();
  data.forEach((item) => {
    item.result.years.forEach((year) => {
      allAges.add(year.age);
    });
  });

  // 年齢でソート
  const sortedAges = Array.from(allAges).sort((a, b) => a - b);

  // 各年齢ごとのデータポイントを作成
  return sortedAges.map((age) => {
    const dataPoint: Record<string, number> = { age };

    data.forEach((item, index) => {
      const yearData = item.result.years.find((y) => y.age === age);
      dataPoint[`scenario_${index}`] = yearData?.asset || 0;
    });

    return dataPoint;
  });
}
