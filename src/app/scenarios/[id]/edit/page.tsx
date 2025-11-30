"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScenarioForm } from "@/components/ScenarioForm";
import { Card, Button } from "@/components/ui";
import { AlertTriangle, ArrowLeft } from "lucide-react";
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
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card variant="bordered" padding="lg" className="border-error-300 bg-error-50">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="text-error-600 flex-shrink-0 mt-0.5" size={24} />
            <p className="text-error-700 font-medium text-lg">{error || "シナリオが見つかりません"}</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="error"
            icon={ArrowLeft}
          >
            ダッシュボードに戻る
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
          シナリオ基本情報の編集
        </h1>
        <p className="text-gray-600 text-lg">
          シナリオの基本設定を編集します。
        </p>
      </div>

      <Card variant="elevated" padding="lg">
        <ScenarioForm
          scenario={scenario}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
