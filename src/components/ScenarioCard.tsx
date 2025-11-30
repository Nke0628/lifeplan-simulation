"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { Eye, Edit2, Copy, Trash2, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
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
      <Card variant="elevated" padding="none" hover className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
              <Calendar className="text-primary-600" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1 text-lg truncate">
                {scenario.name}
              </h3>
              {scenario.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {scenario.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="font-medium text-gray-700">年齢:</span>
              <span>
                {scenario.current_age}歳 → {scenario.target_age}歳
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-gray-400">%</span>
              <span className="font-medium text-gray-700">インフレ率:</span>
              <span>{scenario.inflation_rate}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              <Calendar size={14} />
              <span>更新:</span>
              <span>
                {new Date(scenario.updated_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-3 flex gap-2">
          <Link
            href={`/scenarios/${scenario.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
          >
            <Eye size={16} />
            詳細
          </Link>
          <Link
            href={`/scenarios/${scenario.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-semibold shadow-sm"
          >
            <Edit2 size={16} />
            編集
          </Link>
          <Button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            variant="outline"
            size="sm"
            icon={Copy}
            title="複製"
            className="px-3"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteConfirm(true);
            }}
            disabled={isDeleting}
            variant="error"
            size="sm"
            icon={Trash2}
            title="削除"
            className="px-3"
          />
        </div>
      </Card>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <Card variant="elevated" padding="lg" className="max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-error-100 rounded-lg p-2 flex-shrink-0">
                <AlertTriangle className="text-error-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  シナリオの削除
                </h3>
                <p className="text-gray-700">
                  「<span className="font-semibold">{scenario.name}</span>」を削除してもよろしいですか？
                </p>
                <p className="text-sm text-error-600 mt-2 font-medium">
                  この操作は取り消せません。
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="error"
                size="lg"
                fullWidth
                isLoading={isDeleting}
              >
                削除する
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                variant="outline"
                size="lg"
                fullWidth
              >
                キャンセル
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
