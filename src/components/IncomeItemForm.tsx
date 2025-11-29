"use client";

import { useState } from "react";
import type {
  IncomeItem,
  CreateIncomeItemInput,
  IncomeCategory,
  LifeStage,
} from "@/types/income";

interface IncomeItemFormProps {
  scenarioId: string;
  item?: IncomeItem;
  onSave: (item: CreateIncomeItemInput | IncomeItem) => void;
  onCancel: () => void;
}

const INCOME_CATEGORIES: IncomeCategory[] = ["給与", "ボーナス", "その他収入"];
const LIFE_STAGES: LifeStage[] = ["現役時代", "退職後"];

export function IncomeItemForm({
  scenarioId,
  item,
  onSave,
  onCancel,
}: IncomeItemFormProps) {
  const [formData, setFormData] = useState({
    category: item?.category || "給与",
    name: item?.name || "",
    monthly_amount: item?.monthly_amount || 0,
    bonus_times_per_year: item?.bonus_times_per_year || 2,
    bonus_amount_per_time: item?.bonus_amount_per_time || 0,
    start_age: item?.start_age || 20,
    end_age: item?.end_age || null,
    life_stage: item?.life_stage || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ボーナスの年間合計を計算
  const bonusAnnualTotal = formData.bonus_times_per_year * formData.bonus_amount_per_time;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "項目名は必須です";
    }

    if (formData.category === "ボーナス") {
      if (formData.bonus_times_per_year < 1 || formData.bonus_times_per_year > 12) {
        newErrors.bonus_times_per_year = "年間支給回数は1〜12の範囲で入力してください";
      }
      if (formData.bonus_amount_per_time < 0) {
        newErrors.bonus_amount_per_time = "金額は0以上である必要があります";
      }
    } else {
      if (formData.monthly_amount < 0) {
        newErrors.monthly_amount = "金額は0以上である必要があります";
      }
    }

    if (formData.start_age < 0 || formData.start_age > 120) {
      newErrors.start_age = "開始年齢は0〜120の範囲で入力してください";
    }

    if (
      formData.end_age !== null &&
      (formData.end_age < 0 || formData.end_age > 120)
    ) {
      newErrors.end_age = "終了年齢は0〜120の範囲で入力してください";
    }

    if (
      formData.end_age !== null &&
      formData.end_age <= formData.start_age
    ) {
      newErrors.end_age = "終了年齢は開始年齢より大きい必要があります";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (item) {
      onSave({ ...item, ...formData });
    } else {
      onSave({ scenario_id: scenarioId, ...formData });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* カテゴリ */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as IncomeCategory })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {INCOME_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 項目名 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          項目名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="例: 基本給"
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* 月額（給与・その他収入の場合） */}
      {formData.category !== "ボーナス" && (
        <div>
          <label
            htmlFor="monthly_amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            月額（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="monthly_amount"
            value={formData.monthly_amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                monthly_amount: parseInt(e.target.value) || 0,
              })
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.monthly_amount ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            step="1000"
            required
          />
          {errors.monthly_amount && (
            <p className="mt-1 text-sm text-red-500">{errors.monthly_amount}</p>
          )}
        </div>
      )}

      {/* ボーナス設定（ボーナスの場合） */}
      {formData.category === "ボーナス" && (
        <>
          <div>
            <label
              htmlFor="bonus_times_per_year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              年間支給回数 <span className="text-red-500">*</span>
            </label>
            <select
              id="bonus_times_per_year"
              value={formData.bonus_times_per_year}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bonus_times_per_year: parseInt(e.target.value),
                })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bonus_times_per_year ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              {[1, 2, 3, 4, 6, 12].map((times) => (
                <option key={times} value={times}>
                  年{times}回
                </option>
              ))}
            </select>
            {errors.bonus_times_per_year && (
              <p className="mt-1 text-sm text-red-500">{errors.bonus_times_per_year}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="bonus_amount_per_time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              1回あたりの金額（円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="bonus_amount_per_time"
              value={formData.bonus_amount_per_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bonus_amount_per_time: parseInt(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bonus_amount_per_time ? "border-red-500" : "border-gray-300"
              }`}
              min="0"
              step="10000"
              required
            />
            {errors.bonus_amount_per_time && (
              <p className="mt-1 text-sm text-red-500">{errors.bonus_amount_per_time}</p>
            )}
          </div>

          {/* プレビュー */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 プレビュー: 年間合計{" "}
              <span className="font-bold">
                {bonusAnnualTotal.toLocaleString()}円
              </span>
              {bonusAnnualTotal > 0 && (
                <span className="text-blue-600">
                  {" "}(月平均 {Math.round(bonusAnnualTotal / 12).toLocaleString()}円)
                </span>
              )}
            </p>
          </div>
        </>
      )}

      {/* 開始年齢 */}
      <div>
        <label
          htmlFor="start_age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          開始年齢 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="start_age"
          value={formData.start_age}
          onChange={(e) =>
            setFormData({
              ...formData,
              start_age: parseInt(e.target.value) || 0,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.start_age ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="120"
          required
        />
        {errors.start_age && (
          <p className="mt-1 text-sm text-red-500">{errors.start_age}</p>
        )}
      </div>

      {/* 終了年齢 */}
      <div>
        <label
          htmlFor="end_age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          終了年齢（任意）
        </label>
        <input
          type="number"
          id="end_age"
          value={formData.end_age || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              end_age: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.end_age ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          max="120"
          placeholder="未設定の場合は空欄"
        />
        {errors.end_age && (
          <p className="mt-1 text-sm text-red-500">{errors.end_age}</p>
        )}
      </div>

      {/* ライフステージ */}
      <div>
        <label
          htmlFor="life_stage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ライフステージ（任意）
        </label>
        <select
          id="life_stage"
          value={formData.life_stage || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              life_stage: e.target.value ? (e.target.value as LifeStage) : null,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">未設定</option>
          {LIFE_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          {item ? "更新" : "作成"}
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
