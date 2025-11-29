import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface ScenarioLayoutProps {
  children: ReactNode;
  scenarioId: string;
}

export function ScenarioLayout({ children, scenarioId }: ScenarioLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar scenarioId={scenarioId} />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
