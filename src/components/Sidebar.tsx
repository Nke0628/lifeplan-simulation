"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  scenarioId?: string;
}

export function Sidebar({ scenarioId }: SidebarProps) {
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

  return (
    <aside
      className="flex w-64 flex-col border-r border-gray-200 bg-white"
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
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
