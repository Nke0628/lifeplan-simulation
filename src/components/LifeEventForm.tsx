"use client";

import { useState } from "react";
import type {
  LifeEvent,
  CreateLifeEventInput,
  EventType,
  EventTemplate,
} from "@/types/lifeEvent";
import { EVENT_TEMPLATES } from "@/types/lifeEvent";

interface LifeEventFormProps {
  scenarioId: string;
  event?: LifeEvent;
  onSave: (data: CreateLifeEventInput | LifeEvent) => void;
  onCancel: () => void;
}

const EVENT_TYPES: EventType[] = ['住宅', '結婚・出産', '教育', '車'];

export function LifeEventForm({
  scenarioId,
  event,
  onSave,
  onCancel,
}: LifeEventFormProps) {
  const [formData, setFormData] = useState({
    event_type: event?.event_type || ('住宅' as EventType),
    name: event?.name || "",
    target_age: event?.target_age || 30,
    cost: event?.cost || 0,
    duration_years: event?.duration_years || null,
    annual_cost: event?.annual_cost || null,
    memo: event?.memo || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(!event);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "イベント名は必須です";
    }

    if (formData.target_age < 0 || formData.target_age > 120) {
      newErrors.target_age = "発生年齢は0〜120の範囲で入力してください";
    }

    if (formData.cost < 0) {
      newErrors.cost = "費用は0以上で入力してください";
    }

    if (
      formData.duration_years !== null &&
      (formData.duration_years < 0 || formData.duration_years > 100)
    ) {
      newErrors.duration_years = "継続年数は0〜100の範囲で入力してください";
    }

    if (formData.annual_cost !== null && formData.annual_cost < 0) {
      newErrors.annual_cost = "年間費用は0以上で入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (event) {
      onSave({ ...event, ...formData });
    } else {
      onSave({
        scenario_id: scenarioId,
        ...formData,
      });
    }
  };

  const applyTemplate = (template: EventTemplate) => {
    setFormData({
      ...formData,
      event_type: template.event_type,
      name: template.name,
      cost: template.estimated_cost,
      duration_years: template.duration_years || null,
      annual_cost: template.annual_cost || null,
      memo: template.description,
    });
    setShowTemplates(false);
  };

  const filteredTemplates = EVENT_TEMPLATES.filter(
    (t) => t.event_type === formData.event_type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* テンプレート選択 */}
      {!event && showTemplates && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">テンプレートから選択</h3>
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              手動入力 →
            </button>
          </div>
          <div className="space-y-2">
            {filteredTemplates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyTemplate(template)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-md hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {template.description}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {template.estimated_cost > 0 &&
                    `初期費用: ${template.estimated_cost.toLocaleString()}円`}
                  {template.annual_cost &&
                    ` / 年間費用: ${template.annual_cost.toLocaleString()}円`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* イベントタイプ */}
      <div>
        <label
          htmlFor="event_type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          イベントタイプ <span className="text-red-500">*</span>
        </label>
        <select
          id="event_type"
          value={formData.event_type}
          onChange={(e) => {
            setFormData({ ...formData, event_type: e.target.value as EventType });
            setShowTemplates(true);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* イベント名 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          イベント名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="例: 住宅購入"
          required
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* 発生年齢 */}
      <div>
        <label
          htmlFor="target_age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          発生年齢 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="target_age"
          value={formData.target_age}
          onChange={(e) =>
            setFormData({
              ...formData,
              target_age: parseInt(e.target.value) || 0,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.target_age ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="120"
          required
        />
        {errors.target_age && (
          <p className="mt-1 text-sm text-red-500">{errors.target_age}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">このイベントが発生する年齢</p>
      </div>

      {/* 初期費用 */}
      <div>
        <label
          htmlFor="cost"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          初期費用（円）
        </label>
        <input
          type="number"
          id="cost"
          value={formData.cost}
          onChange={(e) =>
            setFormData({
              ...formData,
              cost: parseFloat(e.target.value) || 0,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.cost ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          step="10000"
        />
        {errors.cost && <p className="mt-1 text-sm text-red-500">{errors.cost}</p>}
        <p className="mt-1 text-sm text-gray-500">一時的にかかる費用</p>
      </div>

      {/* 継続年数 */}
      <div>
        <label
          htmlFor="duration_years"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          継続年数（年）
        </label>
        <input
          type="number"
          id="duration_years"
          value={formData.duration_years || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              duration_years: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.duration_years ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="100"
          placeholder="継続的な費用がある場合"
        />
        {errors.duration_years && (
          <p className="mt-1 text-sm text-red-500">{errors.duration_years}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">年間費用が発生する期間</p>
      </div>

      {/* 年間費用 */}
      <div>
        <label
          htmlFor="annual_cost"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          年間費用（円）
        </label>
        <input
          type="number"
          id="annual_cost"
          value={formData.annual_cost || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              annual_cost: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.annual_cost ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          step="10000"
          placeholder="継続的にかかる費用"
        />
        {errors.annual_cost && (
          <p className="mt-1 text-sm text-red-500">{errors.annual_cost}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">毎年かかる費用</p>
      </div>

      {/* メモ */}
      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ
        </label>
        <textarea
          id="memo"
          value={formData.memo || ""}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="補足情報や詳細"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          {event ? "更新" : "追加"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
