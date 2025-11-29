import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; {currentYear} ライフプランシミュレーション. All rights
            reserved.
          </p>

          {/* Links */}
          <nav className="flex gap-6" aria-label="フッターナビゲーション">
            <Link
              href="/help"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ヘルプ
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              利用規約
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
