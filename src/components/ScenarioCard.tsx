"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Scenario } from "@/types/scenario";

interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDuplicating) return;

    try {
      setIsDuplicating(true);
      const response = await fetch(`/api/scenarios/${scenario.id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("シナリオの複製に失敗しました");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/scenarios/${scenario.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("シナリオの削除に失敗しました");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
      setIsDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg truncate">
            {scenario.name}
          </h3>
          {scenario.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {scenario.description}
            </p>
          )}
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">年齢:</span>
              <span>
                {scenario.current_age}歳 → {scenario.target_age}歳
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">インフレ率:</span>
              <span>{scenario.inflation_rate}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>更新:</span>
              <span>
                {new Date(scenario.updated_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex gap-2">
          <Link
            href={`/scenarios/${scenario.id}`}
            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            詳細
          </Link>
          <Link
            href={`/scenarios/${scenario.id}/edit`}
            className="flex-1 text-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            編集
          </Link>
          <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="複製"
          >
            {isDuplicating ? "..." : "📋"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteConfirm(true);
            }}
            disabled={isDeleting}
            className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="削除"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              シナリオの削除
            </h3>
            <p className="text-gray-600 mb-6">
              「{scenario.name}」を削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "削除中..." : "削除する"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
