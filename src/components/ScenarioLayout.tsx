"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Menu } from "lucide-react";

interface ScenarioLayoutProps {
  children: ReactNode;
  scenarioId: string;
}

export function ScenarioLayout({ children, scenarioId }: ScenarioLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar
          scenarioId={scenarioId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-30 lg:hidden bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110"
          aria-label="メニューを開く"
        >
          <Menu size={24} />
        </button>

        <main className="flex-1 overflow-auto bg-gray-50 w-full">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
