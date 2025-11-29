"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScenarioForm } from "@/components/ScenarioForm";
import type { CreateScenarioInput } from "@/types/scenario";

export default function NewScenarioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: CreateScenarioInput) => {
    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("シナリオの作成に失敗しました");
      }

      const scenario = await response.json();
      router.push(`/scenarios/${scenario.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新規シナリオ作成</h1>
        <p className="text-gray-600 mt-2">
          ライフプランシミュレーションの基本情報を入力してください。
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <ScenarioForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
