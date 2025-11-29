"use client";

import { useState } from "react";
import type { Scenario, CreateScenarioInput } from "@/types/scenario";

interface ScenarioFormProps {
  scenario?: Scenario;
  onSave: (data: CreateScenarioInput | Scenario) => void;
  onCancel: () => void;
}

export function ScenarioForm({ scenario, onSave, onCancel }: ScenarioFormProps) {
  const [formData, setFormData] = useState({
    name: scenario?.name || "",
    description: scenario?.description || "",
    current_age: scenario?.current_age || 30,
    target_age: scenario?.target_age || 100,
    inflation_rate: scenario?.inflation_rate || 2.0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "シナリオ名は必須です";
    }

    if (formData.current_age < 0 || formData.current_age > 120) {
      newErrors.current_age = "現在年齢は0〜120の範囲で入力してください";
    }

    if (formData.target_age < 0 || formData.target_age > 120) {
      newErrors.target_age = "目標年齢は0〜120の範囲で入力してください";
    }

    if (formData.target_age <= formData.current_age) {
      newErrors.target_age = "目標年齢は現在年齢より大きい必要があります";
    }

    if (formData.inflation_rate < 0 || formData.inflation_rate > 20) {
      newErrors.inflation_rate = "インフレ率は0〜20の範囲で入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (scenario) {
      onSave({ ...scenario, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* シナリオ名 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          シナリオ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="例: 基本プラン"
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* 説明 */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          説明（任意）
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="シナリオの説明を入力"
        />
      </div>

      {/* 現在年齢 */}
      <div>
        <label
          htmlFor="current_age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          現在年齢 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="current_age"
          value={formData.current_age}
          onChange={(e) =>
            setFormData({
              ...formData,
              current_age: parseInt(e.target.value) || 0,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.current_age ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="120"
          required
        />
        {errors.current_age && (
          <p className="mt-1 text-sm text-red-500">{errors.current_age}</p>
        )}
      </div>

      {/* 目標年齢 */}
      <div>
        <label
          htmlFor="target_age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          シミュレーション終了年齢 <span className="text-red-500">*</span>
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
      </div>

      {/* インフレ率 */}
      <div>
        <label
          htmlFor="inflation_rate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          インフレ率（%）
        </label>
        <input
          type="number"
          id="inflation_rate"
          value={formData.inflation_rate}
          onChange={(e) =>
            setFormData({
              ...formData,
              inflation_rate: parseFloat(e.target.value) || 0,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.inflation_rate ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="20"
          step="0.1"
        />
        {errors.inflation_rate && (
          <p className="mt-1 text-sm text-red-500">{errors.inflation_rate}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          将来の物価上昇率を想定（デフォルト: 2.0%）
        </p>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          {scenario ? "更新" : "作成"}
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
