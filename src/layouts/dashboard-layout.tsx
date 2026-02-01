import { Outlet } from "react-router-dom";
import { Sidebar, SidebarItem } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { cn } from "../lib/utils";

const sidebarItems: SidebarItem[] = [
  { label: "Overview", description: "Hospital performance", to: "/" },
  { label: "Doctors", description: "Credentials and schedules", to: "/doctors" },
  { label: "Appointments", description: "Slots and assignments", to: "/appointments" },
  { label: "Departments", description: "Capacity planning", to: "/departments" },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-ink-200/60 bg-white/90 h-screen sticky top-0 overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="h-full px-6 py-8">
            <Sidebar items={sidebarItems} />
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-ink-200/60 bg-white/80 backdrop-blur">
            <div className="px-6 py-4 lg:px-10">
              <Topbar title="Dashboard" subtitle="Admin Portal" />
            </div>
          </header>
          <main className={cn("flex-1 px-6 py-8 lg:px-10 lg:py-10")}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
