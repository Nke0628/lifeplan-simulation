"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ScenarioActionsProps {
  scenarioId: string;
  scenarioName: string;
}

export function ScenarioActions({
  scenarioId,
  scenarioName,
}: ScenarioActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDuplicate = async () => {
    if (isDuplicating) return;

    try {
      setIsDuplicating(true);
      const response = await fetch(`/api/scenarios/${scenarioId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("シナリオの複製に失敗しました");
      }

      const newScenario = await response.json();
      router.push(`/scenarios/${newScenario.id}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("シナリオの削除に失敗しました");
      }

      router.push("/scenarios");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDuplicating ? "複製中..." : "📋 複製"}
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🗑️ 削除
      </button>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              シナリオの削除
            </h3>
            <p className="text-gray-600 mb-6">
              「{scenarioName}」を削除してもよろしいですか？
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
    </div>
  );
}
