import type { Scenario } from '@/types/scenario';
import type { IncomeItem } from '@/types/income';
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
  let currentAsset =
    investmentSetting.initial_amount || 0;

  const monthlyContribution = investmentSetting.monthly_contribution || 0;
  const returnRate = (investmentSetting.expected_return_rate || 0) / 100;
  const taxRate = (investmentSetting.tax_rate || 0) / 100;

  let totalIncome = 0;
  let totalExpense = 0;
  let totalEvents = 0;
  let peakAsset = currentAsset;
  let peakAge = startAge;
  let bankruptAge: number | null = null;

  for (let age = startAge; age <= endAge; age++) {
    const year = new Date().getFullYear() + (age - startAge);

    // 年間収入計算
    let yearIncome = 0;
    incomeItems.forEach((item) => {
      if (age >= item.start_age && (item.end_age === null || age <= item.end_age)) {
        yearIncome += item.monthly_amount * 12;
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

    // 資産運用計算
    const yearlyContribution = monthlyContribution * 12;
    const assetBeforeReturn = currentAsset + balance + yearlyContribution;
    const investmentReturn = assetBeforeReturn * returnRate;
    const taxAmount = investmentReturn * taxRate;
    const netReturn = investmentReturn - taxAmount;

    // 新しい資産残高
    currentAsset = assetBeforeReturn + netReturn;

    // ピーク資産の記録
    if (currentAsset > peakAsset) {
      peakAsset = currentAsset;
      peakAge = age;
    }

    // 資産が底をつく判定
    if (currentAsset < 0 && bankruptAge === null) {
      bankruptAge = age;
    }

    years.push({
      age,
      year,
      income: Math.round(yearIncome),
      expense: Math.round(yearExpense),
      balance: Math.round(balance),
      events: Math.round(yearEvents),
      asset: Math.round(currentAsset),
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
      finalAsset: Math.round(currentAsset),
      peakAsset: Math.round(peakAsset),
      peakAge,
      bankruptAge,
    },
  };
}
