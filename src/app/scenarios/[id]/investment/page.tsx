"use client";

import { useEffect, useState } from "react";
import { ScenarioLayout } from "@/components/ScenarioLayout";
import { Button, Input, Card } from "@/components/ui";
import { Wallet, TrendingUp, Percent, DollarSign, Info } from "lucide-react";
import type {
  InvestmentSetting,
  UpdateInvestmentSettingInput,
} from "@/types/investment";
import { DEFAULT_INVESTMENT_SETTING } from "@/types/investment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvestmentPage({ params }: PageProps) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [setting, setSetting] = useState<Partial<InvestmentSetting>>({
    ...DEFAULT_INVESTMENT_SETTING,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingSetting, setHasExistingSetting] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setScenarioId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (scenarioId) {
      fetchSetting();
    }
  }, [scenarioId]);

  const fetchSetting = async () => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/investment`);
      if (!response.ok) {
        throw new Error("設定の取得に失敗しました");
      }
      const data = await response.json();
      setSetting(data);
      setHasExistingSetting(!!data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scenarioId) return;

    try {
      setSaving(true);
      setError(null);

      const method = hasExistingSetting ? "PUT" : "POST";
      const response = await fetch(`/api/scenarios/${scenarioId}/investment`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initial_savings: setting.initial_savings,
          initial_investment_amount: setting.initial_investment_amount,
          monthly_contribution: setting.monthly_contribution,
          expected_return_rate: setting.expected_return_rate,
          tax_rate: setting.tax_rate,
        } as UpdateInvestmentSettingInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "保存に失敗しました");
      }

      const data = await response.json();
      setSetting(data);
      setHasExistingSetting(true);
      alert("保存しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  // 非運用資産の計算
  const nonInvestedAssets = (setting.initial_savings || 0) - (setting.initial_investment_amount || 0);

  // 簡易シミュレーション（30年間）
  const calculateProjection = () => {
    const years = 30;
    const results = [];
    let investedAsset = setting.initial_investment_amount || 0;

    for (let year = 1; year <= years; year++) {
      const yearlyContribution = (setting.monthly_contribution || 0) * 12;
      investedAsset += yearlyContribution;

      const returnAmount = investedAsset * ((setting.expected_return_rate || 0) / 100);
      const taxAmount = returnAmount * ((setting.tax_rate || 0) / 100);
      const netReturn = returnAmount - taxAmount;

      investedAsset += netReturn;

      results.push({
        year,
        amount: Math.round(investedAsset),
      });
    }

    return results;
  };

  const projection = calculateProjection();
  const finalInvestedAmount = projection[projection.length - 1]?.amount || 0;
  const finalTotalAmount = finalInvestedAmount + nonInvestedAssets;
  const totalContribution =
    (setting.initial_investment_amount || 0) +
    (setting.monthly_contribution || 0) * 12 * 30;
  const totalReturn = finalInvestedAmount - totalContribution;

  if (loading) {
    return (
      <ScenarioLayout scenarioId={scenarioId || ""}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </ScenarioLayout>
    );
  }

  return (
    <ScenarioLayout scenarioId={scenarioId || ""}>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            資産運用設定
          </h1>
          <p className="text-gray-600 text-lg">
            複利計算、税金、インフレ率を考慮した資産運用をシミュレーション
          </p>
        </div>

        {error && (
          <Card variant="bordered" padding="md" className="border-error-300 bg-error-50">
            <div className="flex items-start gap-3">
              <Info className="text-error-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-error-700 font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* 現在の資産状況 */}
        <Card variant="gradient" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wallet className="text-primary-600" size={24} />
            現在の資産状況
          </h2>

          <div className="space-y-6">
            {/* 現在の貯蓄額（総資産） */}
            <Input
              type="number"
              id="initial_savings"
              label="現在の貯蓄額（総資産）"
              value={setting.initial_savings || 0}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  initial_savings: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              step="100000"
              icon={DollarSign}
              helperText="銀行預金、現金、投資資産などの合計額"
              fullWidth
            />

            {/* うち、運用に回す金額 */}
            <Input
              type="number"
              id="initial_investment_amount"
              label="うち、運用に回す金額"
              value={setting.initial_investment_amount || 0}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  initial_investment_amount: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              max={setting.initial_savings || 0}
              step="100000"
              icon={TrendingUp}
              helperText="積極的に運用する資産の金額"
              fullWidth
            />

            {/* 非運用資産の表示 */}
            {setting.initial_savings !== undefined && setting.initial_investment_amount !== undefined && (
              <Card
                variant={nonInvestedAssets >= 0 ? "default" : "bordered"}
                padding="md"
                className={nonInvestedAssets >= 0 ? "bg-success-50 border-success-200" : "bg-error-50 border-error-300"}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet size={18} className={nonInvestedAssets >= 0 ? "text-success-600" : "text-error-600"} />
                    非運用資産（生活防衛資金）
                  </span>
                  <span className={`text-xl font-bold ${nonInvestedAssets >= 0 ? 'text-success-700' : 'text-error-700'}`}>
                    {nonInvestedAssets.toLocaleString()}円
                  </span>
                </div>
                {nonInvestedAssets < 0 && (
                  <div className="mt-3 flex items-start gap-2">
                    <Info size={16} className="text-error-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700 font-medium">
                      運用額が総資産額を超えています
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </Card>

        {/* 運用設定 */}
        <Card variant="gradient" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-secondary-600" size={24} />
            運用設定
          </h2>

          <div className="space-y-6">
            {/* 月次積立額 */}
            <Input
              type="number"
              id="monthly_contribution"
              label="月次積立額"
              value={setting.monthly_contribution || 0}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  monthly_contribution: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              step="10000"
              icon={DollarSign}
              helperText="毎月の積立金額"
              fullWidth
            />

            {/* 想定年利回り */}
            <Input
              type="number"
              id="expected_return_rate"
              label="想定年利回り"
              value={setting.expected_return_rate || 0}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  expected_return_rate: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              max="20"
              step="0.1"
              icon={Percent}
              helperText="年間の期待リターン（一般的には3-7%程度）"
              fullWidth
            />

            {/* 税率 */}
            <Input
              type="number"
              id="tax_rate"
              label="税率"
              value={setting.tax_rate || 0}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  tax_rate: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              max="100"
              step="0.1"
              icon={Percent}
              helperText="運用益に対する税率（標準: 20.315%）"
              fullWidth
            />

            {/* 保存ボタン */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || nonInvestedAssets < 0}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={saving}
              >
                {saving ? "保存中..." : "設定を保存"}
              </Button>
            </div>
          </div>
        </Card>

        {/* シミュレーション結果 */}
        <Card variant="gradient" padding="lg" className="bg-gradient-to-br from-primary-50 via-secondary-50/50 to-primary-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={28} />
            30年後のシミュレーション
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">初期総資産</div>
              <div className="text-xl font-bold text-gray-900">
                {(setting.initial_savings || 0).toLocaleString()}円
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">総積立額</div>
              <div className="text-xl font-bold text-gray-900">
                {totalContribution.toLocaleString()}円
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">運用益</div>
              <div className="text-xl font-bold text-green-600">
                +{totalReturn.toLocaleString()}円
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">最終総資産</div>
              <div className="text-xl font-bold text-blue-600">
                {finalTotalAmount.toLocaleString()}円
              </div>
            </div>
          </div>

          {/* 簡易グラフ */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              運用資産の推移（10年ごと）
            </h3>
            <div className="space-y-2">
              {[10, 20, 30].map((year) => {
                const data = projection[year - 1];
                const percentage = (data.amount / finalInvestedAmount) * 100;
                return (
                  <div key={year}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{year}年後</span>
                      <span className="font-semibold text-gray-900">
                        {data.amount.toLocaleString()}円
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-600">
            ※ このシミュレーションは簡易計算です。実際の運用結果は市場環境により変動します。
          </div>
        </Card>

        {/* 計算式の説明 */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Info className="text-gray-600" size={24} />
            計算方法
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <Card variant="bordered" padding="md" className="bg-gray-50 border-gray-300">
              <code className="text-sm font-mono text-gray-900">
                運用益 = 運用資産 × 年利回り × (1 - 税率)
              </code>
            </Card>
            <div className="space-y-3">
              <p className="flex items-start gap-2">
                <strong className="text-gray-900 min-w-[100px]">運用対象:</strong>
                <span>運用資産{(setting.initial_investment_amount || 0).toLocaleString()}円のみに運用益が適用されます</span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-gray-900 min-w-[100px]">非運用資産:</strong>
                <span>{nonInvestedAssets.toLocaleString()}円は生活防衛資金として保持され、運用益は発生しません</span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-gray-900 min-w-[100px]">複利効果:</strong>
                <span>運用益が次年度の運用資産に加わり、さらに運用益を生みます</span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-gray-900 min-w-[100px]">税金:</strong>
                <span>運用益に対して税率{setting.tax_rate}%が課税されます</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ScenarioLayout>
  );
}
