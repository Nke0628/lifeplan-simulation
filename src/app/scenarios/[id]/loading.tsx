import { ScenarioLayout } from "@/components/ScenarioLayout";

export default function Loading() {
  return (
    <ScenarioLayout scenarioId="">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          {/* ヘッダー スケルトン */}
          <div>
            <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-96"></div>
          </div>

          {/* 基本情報カード スケルトン */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* クイックアクション スケルトン */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScenarioLayout>
  );
}
