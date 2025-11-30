'use client';

import { useState, useMemo } from 'react';
import { EVENT_TEMPLATES, type EventType } from '@/types/lifeEvent';

interface BulkEventAddModalProps {
  scenarioId: string;
  currentAge: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedEvent {
  templateIndex: number;
  targetAge: number;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  住宅: 'bg-purple-100 text-purple-700 border-purple-300',
  '結婚・出産': 'bg-pink-100 text-pink-700 border-pink-300',
  教育: 'bg-blue-100 text-blue-700 border-blue-300',
  車: 'bg-green-100 text-green-700 border-green-300',
};

export function BulkEventAddModal({
  scenarioId,
  currentAge,
  isOpen,
  onClose,
  onSuccess,
}: BulkEventAddModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<EventType | 'all'>('all');
  const [selectedEvents, setSelectedEvents] = useState<Map<number, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return EVENT_TEMPLATES.map((template, index) => ({ template, index }));
    }
    return EVENT_TEMPLATES.map((template, index) => ({ template, index })).filter(
      ({ template }) => template.event_type === selectedCategory
    );
  }, [selectedCategory]);

  const handleToggleTemplate = (index: number) => {
    const newSelected = new Map(selectedEvents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.set(index, currentAge);
    }
    setSelectedEvents(newSelected);
  };

  const handleAgeChange = (index: number, age: number) => {
    const newSelected = new Map(selectedEvents);
    newSelected.set(index, age);
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected = new Map(selectedEvents);
    filteredTemplates.forEach(({ index }) => {
      if (!newSelected.has(index)) {
        newSelected.set(index, currentAge);
      }
    });
    setSelectedEvents(newSelected);
  };

  const handleDeselectAll = () => {
    const newSelected = new Map();
    selectedEvents.forEach((age, index) => {
      const template = EVENT_TEMPLATES[index];
      if (selectedCategory === 'all' || template.event_type !== selectedCategory) {
        newSelected.set(index, age);
      }
    });
    setSelectedEvents(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedEvents.size === 0) {
      alert('少なくとも1つのテンプレートを選択してください');
      return;
    }

    // バリデーション
    for (const [index, age] of selectedEvents.entries()) {
      if (age < 0 || age > 120) {
        alert(`年齢は0〜120の範囲で入力してください（${EVENT_TEMPLATES[index].name}）`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/events/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: Array.from(selectedEvents.entries()).map(([template_index, target_age]) => ({
            template_index,
            target_age,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '一括追加に失敗しました');
      }

      onSuccess();
      setSelectedEvents(new Map());
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 総費用計算
  const { totalInitialCost, totalAnnualCost } = useMemo(() => {
    let initialCost = 0;
    let annualCost = 0;

    selectedEvents.forEach((age, index) => {
      const template = EVENT_TEMPLATES[index];
      initialCost += template.estimated_cost;
      if (template.annual_cost && template.duration_years) {
        annualCost += template.annual_cost * template.duration_years;
      }
    });

    return { totalInitialCost: initialCost, totalAnnualCost: annualCost };
  }, [selectedEvents]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            📋 テンプレートから一括追加
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex items-center gap-2 p-4 border-b border-neutral-200 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            すべて
          </button>
          {(['住宅', '結婚・出産', '教育', '車'] as EventType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedCategory(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === type
                  ? EVENT_TYPE_COLORS[type] + ' shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* アクションバー */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              全選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              全解除
            </button>
          </div>
          <div className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{selectedEvents.size}件</span> 選択中
          </div>
        </div>

        {/* テンプレート一覧 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map(({ template, index }) => {
              const isSelected = selectedEvents.has(index);
              const targetAge = selectedEvents.get(index) || currentAge;

              return (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTemplate(index)}
                      className="mt-1 h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            EVENT_TYPE_COLORS[template.event_type]
                          }`}
                        >
                          {template.event_type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        {template.description}
                      </p>

                      {/* 費用情報 */}
                      <div className="space-y-1 text-sm text-neutral-700 mb-3">
                        {template.estimated_cost > 0 && (
                          <div>
                            初期費用: <span className="font-semibold">{template.estimated_cost.toLocaleString()}円</span>
                          </div>
                        )}
                        {template.annual_cost && template.duration_years && (
                          <div>
                            継続費用: <span className="font-semibold">
                              {template.annual_cost.toLocaleString()}円/年 × {template.duration_years}年
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 年齢設定 */}
                      {isSelected && (
                        <div className="pt-3 border-t border-neutral-200">
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            発生年齢
                          </label>
                          <input
                            type="number"
                            value={targetAge}
                            onChange={(e) =>
                              handleAgeChange(index, parseInt(e.target.value) || 0)
                            }
                            min={0}
                            max={120}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              このカテゴリにはテンプレートがありません
            </div>
          )}
        </div>

        {/* フッター（サマリーとボタン） */}
        <div className="border-t border-neutral-200 p-6 bg-neutral-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-neutral-600">総初期費用</div>
              <div className="text-xl font-bold text-neutral-900">
                {totalInitialCost.toLocaleString()}円
              </div>
            </div>
            {totalAnnualCost > 0 && (
              <div>
                <div className="text-sm text-neutral-600">総継続費用</div>
                <div className="text-xl font-bold text-neutral-900">
                  {totalAnnualCost.toLocaleString()}円
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedEvents.size === 0}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? '追加中...'
                : `追加 (${selectedEvents.size}件)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
