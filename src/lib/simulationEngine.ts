import type { Scenario } from '@/types/scenario';
import type { IncomeItem } from '@/types/income';
import { calculateAnnualIncome } from '@/types/income';
import type { ExpenseItem } from '@/types/expense';
import type { LifeEvent } from '@/types/lifeEvent';
import type { InvestmentSetting } from '@/types/investment';
import type { SimulationResult, YearlyData } from '@/types/simulation';

interface SimulationInput {
  scenario: Scenario;
  incomeItems: IncomeItem[];
  expenseItems: ExpenseItem[];
  lifeEvents: LifeEvent[];
  investmentSetting: Partial<InvestmentSetting>;
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const { scenario, incomeItems, expenseItems, lifeEvents, investmentSetting } =
    input;

  const startAge = scenario.current_age;
  const endAge = scenario.target_age;
  const inflationRate = scenario.inflation_rate / 100;

  const years: YearlyData[] = [];

  // 初期資産設定
  const initialSavings = investmentSetting.initial_savings || 0;
  const initialInvestmentAmount = investmentSetting.initial_investment_amount || 0;

  let totalAsset = initialSavings; // 総資産（運用資産 + 非運用資産）
  let investedAsset = initialInvestmentAmount; // 運用資産のみ

  const monthlyContribution = investmentSetting.monthly_contribution || 0;
  const returnRate = (investmentSetting.expected_return_rate || 0) / 100;
  const taxRate = (investmentSetting.tax_rate || 0) / 100;

  let totalIncome = 0;
  let totalExpense = 0;
  let totalEvents = 0;
  let peakAsset = totalAsset;
  let peakAge = startAge;
  let bankruptAge: number | null = null;

  for (let age = startAge; age <= endAge; age++) {
    const year = new Date().getFullYear() + (age - startAge);

    // 年間収入計算
    let yearIncome = 0;
    incomeItems.forEach((item) => {
      if (age >= item.start_age && (item.end_age === null || age <= item.end_age)) {
        yearIncome += calculateAnnualIncome(item);
      }
    });

    // 年間支出計算
    let yearExpense = 0;
    expenseItems.forEach((item) => {
      if (age >= item.start_age && (item.end_age === null || age <= item.end_age)) {
        yearExpense += item.monthly_amount * 12;
      }
    });

    // ライフイベント費用計算
    let yearEvents = 0;
    lifeEvents.forEach((event) => {
      // 初期費用
      if (age === event.target_age) {
        yearEvents += event.cost;
      }
      // 継続費用
      if (
        event.duration_years &&
        event.annual_cost &&
        age >= event.target_age &&
        age < event.target_age + event.duration_years
      ) {
        yearEvents += event.annual_cost;
      }
    });

    // 年次収支
    const balance = yearIncome - yearExpense - yearEvents;

    // 資産運用計算（運用資産のみに適用）
    const yearlyContribution = monthlyContribution * 12;

    // 月次積立は運用資産に追加
    investedAsset += yearlyContribution;

    // 運用益の計算（運用資産のみ）
    const investmentReturn = investedAsset * returnRate;
    const taxAmount = investmentReturn * taxRate;
    const netReturn = investmentReturn - taxAmount;

    // 運用資産に運用益を追加
    investedAsset += netReturn;

    // 総資産の更新（運用資産 + 非運用資産 + 年次収支）
    totalAsset += balance + yearlyContribution + netReturn;

    // ピーク資産の記録
    if (totalAsset > peakAsset) {
      peakAsset = totalAsset;
      peakAge = age;
    }

    // 資産が底をつく判定
    if (totalAsset < 0 && bankruptAge === null) {
      bankruptAge = age;
    }

    years.push({
      age,
      year,
      income: Math.round(yearIncome),
      expense: Math.round(yearExpense),
      balance: Math.round(balance),
      events: Math.round(yearEvents),
      asset: Math.round(totalAsset),
      investmentReturn: Math.round(netReturn),
    });

    totalIncome += yearIncome;
    totalExpense += yearExpense;
    totalEvents += yearEvents;
  }

  return {
    years,
    summary: {
      totalIncome: Math.round(totalIncome),
      totalExpense: Math.round(totalExpense),
      totalEvents: Math.round(totalEvents),
      finalAsset: Math.round(totalAsset),
      peakAsset: Math.round(peakAsset),
      peakAge,
      bankruptAge,
    },
  };
}
