export type EventType = '住宅' | '結婚・出産' | '教育' | '車';

export interface LifeEvent {
  id: string;
  scenario_id: string;
  event_type: EventType;
  name: string;
  target_age: number;
  cost: number;
  duration_years: number | null;
  annual_cost: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLifeEventInput {
  scenario_id: string;
  event_type: EventType;
  name: string;
  target_age: number;
  cost: number;
  duration_years?: number | null;
  annual_cost?: number | null;
  memo?: string | null;
}

export interface UpdateLifeEventInput {
  event_type?: EventType;
  name?: string;
  target_age?: number;
  cost?: number;
  duration_years?: number | null;
  annual_cost?: number | null;
  memo?: string | null;
}

// イベントテンプレート
export interface EventTemplate {
  name: string;
  event_type: EventType;
  estimated_cost: number;
  duration_years?: number;
  annual_cost?: number;
  description: string;
}

// 標準的なイベントテンプレート
export const EVENT_TEMPLATES: EventTemplate[] = [
  // 住宅関連
  {
    name: '住宅購入（頭金）',
    event_type: '住宅',
    estimated_cost: 10000000,
    description: '住宅購入時の頭金（物件価格の20%程度）',
  },
  {
    name: '住宅ローン',
    event_type: '住宅',
    estimated_cost: 0,
    duration_years: 35,
    annual_cost: 1200000,
    description: '35年ローンの年間返済額',
  },
  {
    name: 'リフォーム費用',
    event_type: '住宅',
    estimated_cost: 3000000,
    description: '大規模リフォーム費用',
  },

  // 結婚・出産
  {
    name: '結婚費用',
    event_type: '結婚・出産',
    estimated_cost: 4000000,
    description: '結婚式・披露宴・新婚旅行等',
  },
  {
    name: '出産費用',
    event_type: '結婚・出産',
    estimated_cost: 500000,
    description: '出産に伴う費用',
  },

  // 教育
  {
    name: '私立大学（4年間）',
    event_type: '教育',
    estimated_cost: 0,
    duration_years: 4,
    annual_cost: 1500000,
    description: '私立大学の授業料・生活費',
  },
  {
    name: '国公立大学（4年間）',
    event_type: '教育',
    estimated_cost: 0,
    duration_years: 4,
    annual_cost: 800000,
    description: '国公立大学の授業料・生活費',
  },
  {
    name: '私立高校（3年間）',
    event_type: '教育',
    estimated_cost: 0,
    duration_years: 3,
    annual_cost: 1000000,
    description: '私立高校の授業料・学費',
  },
  {
    name: '私立中学校（3年間）',
    event_type: '教育',
    estimated_cost: 0,
    duration_years: 3,
    annual_cost: 1200000,
    description: '私立中学校の授業料・学費',
  },
  {
    name: '習い事・塾',
    event_type: '教育',
    estimated_cost: 0,
    duration_years: 10,
    annual_cost: 500000,
    description: '習い事・学習塾の費用',
  },

  // 車
  {
    name: '車購入',
    event_type: '車',
    estimated_cost: 3000000,
    description: '新車購入費用',
  },
  {
    name: '車維持費',
    event_type: '車',
    estimated_cost: 0,
    duration_years: 10,
    annual_cost: 500000,
    description: '保険・税金・車検・ガソリン代等',
  },
];
