'use client';

import type { LifeEvent } from '@/types/lifeEvent';

interface LifeEventTimelineProps {
  lifeEvents: LifeEvent[];
  currentAge: number;
  targetAge: number;
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  housing: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-700',
  },
  marriage: {
    bg: 'bg-pink-100',
    border: 'border-pink-500',
    text: 'text-pink-700',
  },
  education: {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-700',
  },
  vehicle: {
    bg: 'bg-purple-100',
    border: 'border-purple-500',
    text: 'text-purple-700',
  },
  other: {
    bg: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-700',
  },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  housing: '住宅',
  marriage: '結婚・出産',
  education: '教育',
  vehicle: '車',
  other: 'その他',
};

export function LifeEventTimeline({
  lifeEvents,
  currentAge,
  targetAge,
}: LifeEventTimelineProps) {
  if (lifeEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        ライフイベントが登録されていません
      </div>
    );
  }

  // イベントを年齢順にソート
  const sortedEvents = [...lifeEvents].sort((a, b) => a.target_age - b.target_age);

  // タイムラインの幅を計算
  const ageRange = targetAge - currentAge;

  const getPositionPercent = (age: number) => {
    return ((age - currentAge) / ageRange) * 100;
  };

  const getColorClasses = (eventType: string) => {
    return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.other;
  };

  return (
    <div className="space-y-8">
      {/* タイムライン視覚化 */}
      <div className="relative pt-8 pb-4">
        {/* 年齢軸 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded" />

        {/* 現在年齢マーカー */}
        <div className="absolute top-0 left-0" style={{ transform: 'translateX(-50%)' }}>
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-red-600">
              現在 ({currentAge}歳)
            </span>
          </div>
        </div>

        {/* 目標年齢マーカー */}
        <div className="absolute top-0 right-0" style={{ transform: 'translateX(50%)' }}>
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-600">
              {targetAge}歳
            </span>
          </div>
        </div>

        {/* イベントマーカー */}
        {sortedEvents.map((event, index) => {
          const position = getPositionPercent(event.target_age);
          const colorClasses = getColorClasses(event.event_type);

          return (
            <div
              key={event.id}
              className="absolute top-0"
              style={{
                left: `${position}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className={`w-4 h-4 ${colorClasses.bg} ${colorClasses.border} border-2 rounded-full`}
              />
              <div
                className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32"
                style={{ marginTop: `${(index % 3) * 2.5}rem` }}
              >
                <div
                  className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-2 shadow-sm`}
                >
                  <div className={`text-xs font-semibold ${colorClasses.text} truncate`}>
                    {event.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {event.target_age}歳
                  </div>
                  <div className="text-xs text-gray-700 font-medium mt-1">
                    {event.cost.toLocaleString()}円
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* イベントリスト */}
      <div className="mt-16 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">イベント詳細</h3>
        <div className="space-y-3">
          {sortedEvents.map((event) => {
            const colorClasses = getColorClasses(event.event_type);

            return (
              <div
                key={event.id}
                className={`${colorClasses.bg} ${colorClasses.border} border-l-4 p-4 rounded-r-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}
                      >
                        {EVENT_TYPE_LABELS[event.event_type] || 'その他'}
                      </span>
                      <span className="font-semibold text-gray-900">{event.name}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">発生年齢:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {event.target_age}歳
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">費用:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {event.cost.toLocaleString()}円
                        </span>
                      </div>
                      {event.duration_years && event.duration_years > 0 && (
                        <>
                          <div>
                            <span className="text-gray-500">継続期間:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {event.duration_years}年間
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">年間費用:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {event.annual_cost?.toLocaleString() || 0}円
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {event.memo && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="text-gray-500">メモ:</span>
                        <span className="ml-2">{event.memo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
