"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScenarioForm } from "@/components/ScenarioForm";
import type { Scenario, UpdateScenarioInput } from "@/types/scenario";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ScenarioEditPage({ params }: PageProps) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setScenarioId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!scenarioId) return;

    const fetchScenario = async () => {
      try {
        const response = await fetch(`/api/scenarios/${scenarioId}`);
        if (!response.ok) {
          throw new Error("シナリオの取得に失敗しました");
        }
        const data = await response.json();
        setScenario(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [scenarioId]);

  const handleSave = async (data: UpdateScenarioInput | Scenario) => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("シナリオの更新に失敗しました");
      }

      router.push(`/scenarios/${scenarioId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleCancel = () => {
    if (scenarioId) {
      router.push(`/scenarios/${scenarioId}`);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error || "シナリオが見つかりません"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">シナリオ基本情報の編集</h1>
        <p className="text-gray-600 mt-2">
          シナリオの基本設定を編集します。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <ScenarioForm
          scenario={scenario}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
