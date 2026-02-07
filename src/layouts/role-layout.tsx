import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import type { SidebarItem } from "@/components/layout/Sidebar";
import { CommonTopbar } from "@/components/layout/Topbar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useMeQuery } from "@/features/auth/authApi";
import { clearAuth, setRole } from "@/features/auth/authSlice";
import type { Role } from "@/features/auth/authSlice";
import { deleteCookie, getCookie } from "@/lib/cookie";
import { cn } from "@/lib/utils";
import { ChartNoAxesGantt, Layers, Stethoscope, Users } from "lucide-react";

const adminSidebar: SidebarItem[] = [
  {
    label: "Overview",
    description: "Hospital performance",
    to: "/",
    icon: Layers,
  },
  {
    label: "Doctors",
    description: "Credentials and schedules",
    to: "/doctors/list",
    icon: Stethoscope,
  },
  {
    label: "Appointments",
    description: "Slots and assignments",
    to: "/appointment-list",
    icon: ChartNoAxesGantt,
  },
  {
    label: "Receptionist",
    description: "Capacity planning",
    to: "/receptionist",
    icon: Users,
  },
];

const receptionistSidebar: SidebarItem[] = [
  { label: "My day", description: "Appointments and tasks", to: "/" },
  { label: "Patient list", description: "History and notes", to: "/patients" },
  {
    label: "Care plans",
    description: "Review and follow up",
    to: "/care-plans",
  },
  { label: "Messages", description: "Team updates", to: "/messages" },
];

function normalizeRole(value?: string): Role | null {
  if (!value) return null;
  const role = value.toLowerCase();
  if (role === "admin" || role === "doctor" || role === "receptionist") {
    return role;
  }
  return null;
}

export function RoleLayout() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const token = getCookie("token");
  const { data, isLoading, isError } = useMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    const normalized = normalizeRole(data?.role);
    if (normalized && normalized !== role) {
      dispatch(setRole(normalized));
    }
  }, [data, dispatch, role]);

  useEffect(() => {
    if (isError) {
      deleteCookie("token");
      dispatch(clearAuth());
    }
  }, [dispatch, isError]);

  const normalizedRole = normalizeRole(data?.role);
  const effectiveRole = role ?? normalizedRole;

  if (!token && !effectiveRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (token && (isLoading || (!effectiveRole && !isError))) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-600">
        Loading your workspace...
      </div>
    );
  }

  if (!effectiveRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const sidebarItems =
    effectiveRole === "admin" ? adminSidebar : receptionistSidebar;

  const topbarTitle =
    effectiveRole === "admin" ? "Admin dashboard" : "Receptionist dashboard";

  const topbarSubtitle =
    effectiveRole === "admin"
      ? "Create doctors, assign appointments, and oversee every slot."
      : "See upcoming appointments and review patient history.";

  if (effectiveRole === "doctor") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-ink-200/60 bg-white/50 backdrop-blur-sm h-screen sticky top-0 overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="h-full p-6">
            <Sidebar items={sidebarItems} />
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="">
            <div className="px-6 py-4 lg:px-10">
              <CommonTopbar title={topbarTitle} subtitle={topbarSubtitle} />
            </div>
          </header>
          <main className={cn("flex-1 p-6 md:p-8")}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
