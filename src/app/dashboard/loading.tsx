import { MainLayout } from "@/components/MainLayout";

export default function Loading() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ヘッダー スケルトン */}
        <div className="mb-8 animate-pulse">
          <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>

        {/* サマリーカード スケルトン */}
        <div className="mb-8 grid gap-6 md:grid-cols-3 animate-pulse">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* シナリオカード スケルトン */}
        <div className="mb-6 flex items-center justify-between animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-gray-200 rounded flex-1"></div>
                <div className="h-9 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
