"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScenarioLayout } from "@/components/ScenarioLayout";
import { LifeEventForm } from "@/components/LifeEventForm";
import { BulkEventAddModal } from "@/components/BulkEventAddModal";
import type { Scenario } from "@/types/scenario";
import type {
  LifeEvent,
  CreateLifeEventInput,
  EventType,
} from "@/types/lifeEvent";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  住宅: "bg-purple-100 text-purple-700 border-purple-200",
  "結婚・出産": "bg-pink-100 text-pink-700 border-pink-200",
  教育: "bg-blue-100 text-blue-700 border-blue-200",
  車: "bg-green-100 text-green-700 border-green-200",
};

export default function LifeEventsPage({ params }: PageProps) {
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | undefined>();
  const [filterType, setFilterType] = useState<EventType | "all">("all");

  useEffect(() => {
    params.then((resolvedParams) => {
      setScenarioId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (scenarioId) {
      fetchScenario();
      fetchEvents();
    }
  }, [scenarioId]);

  const fetchScenario = async () => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`);
      if (!response.ok) {
        throw new Error("シナリオの取得に失敗しました");
      }
      const data = await response.json();
      setScenario(data);
    } catch (err) {
      console.error('Failed to fetch scenario:', err);
    }
  };

  const fetchEvents = async () => {
    if (!scenarioId) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/events`);
      if (!response.ok) {
        throw new Error("イベントの取得に失敗しました");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: CreateLifeEventInput | LifeEvent) => {
    if (!scenarioId) return;

    try {
      if ("id" in data) {
        // 更新
        const response = await fetch(
          `/api/scenarios/${scenarioId}/events/${data.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) throw new Error("更新に失敗しました");
      } else {
        // 新規作成
        const response = await fetch(`/api/scenarios/${scenarioId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("作成に失敗しました");
      }

      await fetchEvents();
      setShowForm(false);
      setEditingEvent(undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!scenarioId) return;
    if (!confirm("このイベントを削除してもよろしいですか？")) return;

    try {
      const response = await fetch(
        `/api/scenarios/${scenarioId}/events/${eventId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("削除に失敗しました");

      await fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const filteredEvents =
    filterType === "all"
      ? events
      : events.filter((event) => event.event_type === filterType);

  const totalCost = filteredEvents.reduce((sum, event) => {
    const initialCost = event.cost;
    const continuousCost =
      (event.annual_cost || 0) * (event.duration_years || 0);
    return sum + initialCost + continuousCost;
  }, 0);

  if (loading) {
    return (
      <ScenarioLayout scenarioId={scenarioId || ""}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </ScenarioLayout>
    );
  }

  return (
    <ScenarioLayout scenarioId={scenarioId || ""}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ライフイベント</h1>
            <p className="text-gray-600 mt-1">
              人生の主要なイベントを登録して費用を計画します
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold"
            >
              📋 テンプレートから一括追加
            </button>
            <button
              onClick={() => {
                setEditingEvent(undefined);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              ➕ イベント追加
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* イベント追加/編集フォーム */}
        {showForm && scenarioId && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEvent ? "イベント編集" : "新規イベント追加"}
            </h2>
            <LifeEventForm
              scenarioId={scenarioId}
              event={editingEvent}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingEvent(undefined);
              }}
            />
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              フィルター:
            </span>
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              すべて ({events.length})
            </button>
            {(["住宅", "結婚・出産", "教育", "車"] as EventType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === type
                      ? EVENT_TYPE_COLORS[type]
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type} ({events.filter((e) => e.event_type === type).length})
                </button>
              )
            )}
          </div>
        </div>

        {/* サマリー */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                {filterType === "all" ? "全イベント" : filterType}の総費用
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {totalCost.toLocaleString()}円
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">イベント数</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredEvents.length}件
              </div>
            </div>
          </div>
        </div>

        {/* イベント一覧（タイムライン形式） */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              イベントがまだありません
            </h2>
            <p className="text-gray-600 mb-6">
              ライフイベントを追加して、将来の費用を計画しましょう
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              最初のイベントを追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            EVENT_TYPE_COLORS[event.event_type]
                          }`}
                        >
                          {event.event_type}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {event.target_age}歳
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      {event.memo && (
                        <p className="text-sm text-gray-600 mt-2">
                          {event.memo}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">初期費用</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {event.cost.toLocaleString()}円
                      </div>
                    </div>
                    {event.duration_years && (
                      <div>
                        <div className="text-xs text-gray-500">継続年数</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {event.duration_years}年間
                        </div>
                      </div>
                    )}
                    {event.annual_cost && (
                      <div>
                        <div className="text-xs text-gray-500">年間費用</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {event.annual_cost.toLocaleString()}円
                        </div>
                      </div>
                    )}
                    {event.duration_years && event.annual_cost && (
                      <div>
                        <div className="text-xs text-gray-500">総費用</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {(
                            event.cost +
                            event.annual_cost * event.duration_years
                          ).toLocaleString()}
                          円
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 一括追加モーダル */}
        {scenario && (
          <BulkEventAddModal
            scenarioId={scenarioId || ""}
            currentAge={scenario.current_age}
            isOpen={showBulkModal}
            onClose={() => setShowBulkModal(false)}
            onSuccess={fetchEvents}
          />
        )}
      </div>
    </ScenarioLayout>
  );
}
