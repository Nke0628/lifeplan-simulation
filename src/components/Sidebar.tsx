"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface SidebarProps {
  scenarioId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ scenarioId, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = scenarioId
    ? [
        { name: "基本情報", href: `/scenarios/${scenarioId}/edit` },
        { name: "収入", href: `/scenarios/${scenarioId}/income` },
        { name: "支出", href: `/scenarios/${scenarioId}/expense` },
        { name: "ライフイベント", href: `/scenarios/${scenarioId}/events` },
        { name: "資産運用", href: `/scenarios/${scenarioId}/investment` },
        {
          name: "シミュレーション結果",
          href: `/scenarios/${scenarioId}/result`,
        },
      ]
    : [
        { name: "ダッシュボード", href: "/dashboard" },
        { name: "シナリオ一覧", href: "/scenarios" },
        { name: "設定", href: "/settings" },
      ];

  const handleLinkClick = () => {
    // モバイルでリンククリック時にサイドバーを閉じる
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white"
        aria-label="サイドバー"
      >
        <nav
          className="flex-1 space-y-1 px-2 py-4"
          aria-label={
            scenarioId ? "シナリオ編集ナビゲーション" : "メインナビゲーション"
          }
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />

          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            aria-label="モバイルサイドバー"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                aria-label="サイドバーを閉じる"
              >
                <X size={20} />
              </button>
            </div>

            <nav
              className="flex-1 space-y-1 px-2 py-4 overflow-y-auto"
              aria-label={
                scenarioId ? "シナリオ編集ナビゲーション" : "メインナビゲーション"
              }
            >
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={handleLinkClick}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
