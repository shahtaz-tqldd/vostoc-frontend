import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CURRENT_DOCTOR } from "@/pages/doctors/overview/mock_data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, Search } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AddReceptionistDialog from "@/pages/admin/receptionist-list/add-receptionist-dialog";
import { useMemo, useState } from "react";
import { useGetDepartmentsQuery } from "@/features/department/departmentApi";
import AppointmentBookingDialog from "@/pages/common/appointment-list/add-appointment-dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { deleteCookie } from "@/lib/cookie";
import { getProfileItemsByRole } from "@/config/navigation";

export type TopbarProps = {
  title: string;
  subtitle: string;
};

export function CommonTopbar({ title, subtitle }: TopbarProps) {
  const location = useLocation();
  const isReceptionPage = location.pathname === "/receptionist";
  const [addReceptionist, setAddReceptionist] = useState(false);
  const [appointmentBookingOpen, setAppointmentBookingOpen] = useState(false);
  const { data: departments = [] } = useGetDepartmentsQuery();

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: department.name,
        value: department.id,
        specialties: department.specialties?.map((item) => ({
          label: item.name,
          value: item.name,
        })),
      })),
    [departments],
  );
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            {title}
          </h2>
          <p className="text-sm text-ink-600">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Search patients, doctors, slots"
              className="h-9 !w-[260px] !pl-8"
            />
            <Search
              size={14}
              className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
            />
          </div>

          <Button
            variant="primary"
            onClick={
              isReceptionPage
                ? () => setAddReceptionist(true)
                : () => setAppointmentBookingOpen(true)
            }
          >
            <Plus size={14} />
            {isReceptionPage ? "Add Receptionist" : "New appointment"}
          </Button>
          <ProfileMenu />
        </div>
      </div>
      <AddReceptionistDialog
        open={addReceptionist}
        onOpenChange={setAddReceptionist}
        departmentOptions={departmentOptions}
      />
      <AppointmentBookingDialog
        open={appointmentBookingOpen}
        onOpenChange={setAppointmentBookingOpen}
        departmentOptions={departmentOptions}
      />
    </>
  );
}

export function ReceptionistTopbar({ title, subtitle }: TopbarProps) {
  const location = useLocation();
  const isReceptionPage = location.pathname === "/receptionist";
  const [addReceptionist, setAddReceptionist] = useState(false);
  const { data: departments = [] } = useGetDepartmentsQuery();

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: department.name,
        value: department.id,
        specialties: department.specialties?.map((item) => ({
          label: item.name,
          value: item.name,
        })),
      })),
    [departments],
  );
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            {title}
          </h2>
          <p className="text-sm text-ink-600">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Search patients, doctors, slots"
              className="h-9 !w-[260px] !pl-8"
            />
            <Search
              size={14}
              className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
            />
          </div>

          <Button
            variant="primary"
            onClick={
              isReceptionPage
                ? () => setAddReceptionist(true)
                : () => setAddReceptionist(false)
            }
          >
            <Plus size={14} />
            {isReceptionPage ? "Add Receptionist" : "New appointment"}
          </Button>

          <ProfileMenu />
        </div>
      </div>
      <AddReceptionistDialog
        open={addReceptionist}
        onOpenChange={setAddReceptionist}
        departmentOptions={departmentOptions}
      />
    </>
  );
}

export function DoctorTopbar() {
  const me = useAppSelector((state) => state.auth.me);
  const doctorName = me?.name ?? CURRENT_DOCTOR.name;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Good morning, <span className="text-slate-500">{doctorName}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Monday, February 2 · 2026
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            placeholder="Search patients, reports"
            className="h-9 !w-[260px] !pl-8"
          />
          <Search
            size={14}
            className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
          />
        </div>

        <ProfileMenu />
      </div>
    </div>
  );
}

const ProfileMenu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.role);
  const me = useAppSelector((state) => state.auth.me);
  const menuItems = getProfileItemsByRole(role);
  const displayName = me?.name || me?.username || "Profile";
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    deleteCookie("token");
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400"
          aria-label="Open profile menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={CURRENT_DOCTOR.avatar} alt={displayName} />
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="!w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-medium text-ink-900">{displayName}</p>
          <p className="text-xs capitalize text-ink-500">{role ?? "User"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
            <NavLink to={item.to}>{item.label}</NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut size={14} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
