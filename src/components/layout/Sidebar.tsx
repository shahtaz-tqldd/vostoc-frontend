import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { NavLink } from "react-router-dom";

export type SidebarItem = {
  label: string;
  description?: string;
  to: string;
};

type SidebarProps = {
  items?: SidebarItem[];
};

export function Sidebar({ items = [] }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="space-y-2">
        <Badge variant="mint">Vostoc Care</Badge>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Appointment Ops
        </h1>
        <p className="text-sm text-ink-600">
          Unified control center for doctors, clinics, and patient flow.
        </p>
      </div>

      <nav className="space-y-3">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "block rounded-2xl border px-4 py-3 transition",
                isActive
                  ? "border-ink-900 bg-ink-900 text-white shadow-glow"
                  : "border-ink-200/70 bg-white/70 text-ink-700 hover:border-ink-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="text-sm font-semibold">{item.label}</div>
                {item.description && (
                  <div
                    className={cn(
                      "text-xs",
                      isActive ? "text-white/80" : "text-ink-500",
                    )}
                  >
                    {item.description}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-ink-200/70 bg-white/70 p-4">
          <p className="text-xs text-ink-500">Today&#39;s highlight</p>
          <p className="mt-2 text-sm font-semibold text-ink-900">
            94% slots filled across Cardiology
          </p>
          <p className="mt-1 text-xs text-ink-500">Peak hours: 10:00 - 14:00</p>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          Export daily report
        </Button>
      </div>
    </div>
  );
}
