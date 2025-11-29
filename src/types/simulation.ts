export interface YearlyData {
  age: number;
  year: number;
  income: number;
  expense: number;
  balance: number; // 年次収支
  events: number; // ライフイベント費用
  asset: number; // 資産残高
  investmentReturn: number; // 運用益
}

export interface SimulationResult {
  years: YearlyData[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalEvents: number;
    finalAsset: number;
    peakAsset: number;
    peakAge: number;
    bankruptAge: number | null; // 資産が底をつく年齢
  };
}
