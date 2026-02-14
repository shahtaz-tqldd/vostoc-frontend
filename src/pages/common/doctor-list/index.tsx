import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetDoctorsQuery } from "@/features/doctors/doctorsApi";
import { useAppSelector } from "@/app/hooks";
import { selectDepartmentFilterOptions } from "@/features/department/departmentSlice";
import type { DoctorSchedule } from "@/features/doctors/type";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  contact: string;
  status: "Active" | "On Leave" | "Unavailable";
  imageUrl: string;
  schedules: DoctorSchedule[];
  scheduleDisplay: string;
  actions: string;
};

const dayLabel: Record<string, string> = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

const formatDay = (day: string) => dayLabel[day] ?? day;

const DoctorScheduleMenu = ({ schedules }: { schedules: DoctorSchedule[] }) => {
  if (schedules.length === 0) {
    return <span className="text-sm text-muted-foreground">No schedule</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2.5">
          <CalendarDays size={14} className="mr-1.5" />
          Schedules ({schedules.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Doctor schedule</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1 p-1">
          {schedules.map((slot) => (
            <div
              key={slot.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-2"
            >
              <p className="text-xs font-semibold text-slate-700">
                {formatDay(slot.day)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                <Clock3 size={12} />
                {slot.startTime} - {slot.endTime}
              </p>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const getDoctorColumns = (isAdmin: boolean): ColumnDef<Doctor>[] => {
  const baseColumns: ColumnDef<Doctor>[] = [
  {
    header: "Doctor",
    accessorKey: "name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={row.imageUrl} alt={row.name} />
          <AvatarFallback>
            {row.name.split(" ")[1]?.charAt(0) || row.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-base">{row.name}</div>
          <div className="text-sm text-muted-foreground uppercase">
            doc-{row.id.slice(-6)}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: "Specialty",
    accessorKey: "specialty",
  },
  {
    header: "Department",
    accessorKey: "department",
  },
  {
    header: "Contact",
    accessorKey: "contact",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const variant = {
        Active: "success",
        "On Leave": "failed",
        Unavailable: "disabled",
      }[row.status] as "success" | "failed" | "disabled";

      return <StatusBadge status={variant} label={row.status} />;
    },
  },
  {
    header: "Schedule",
    accessorKey: "scheduleDisplay",
    cell: (row) => <DoctorScheduleMenu schedules={row.schedules} />,
  },
  ];

  if (!isAdmin) {
    return baseColumns;
  }

  return [
    ...baseColumns,
    {
      header: "",
      accessorKey: "actions",
      cell: (row) => (
        <ThreeDotMenu
          items={[
            {
              label: "View",
              icon: Eye,
              onClick: () => {
                console.log("View doctor", row.id);
              },
            },
            {
              label: "Update",
              icon: Pencil,
              onClick: () => {
                console.log("Update doctor", row.id);
              },
            },
            {
              label: "Delete",
              icon: Trash2,
              destructive: true,
              onClick: () => {
                console.log("Delete doctor", row.id);
              },
            },
          ]}
        />
      ),
    },
  ];
};

export default function DoctorListPage() {
  // Manage pagination state in the parent component
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const role = useAppSelector((state) => state.auth.role);

  const { data: doctorsData } = useGetDoctorsQuery();

  const doctors = useMemo<Doctor[]>(() => {
    if (!doctorsData) {
      return [];
    }

    return doctorsData?.data?.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty?.name ?? "—",
      department: doctor.department?.name ?? "—",
      contact: doctor.contactNumber ?? "—",
      status: "Active",
      imageUrl: doctor.profileImageUrl ?? "",
      schedules: doctor.schedules ?? [],
      scheduleDisplay: `${doctor.schedules?.length ?? 0} schedules`,
      actions: "actions",
    }));
  }, [doctorsData]);

  const doctorColumns = useMemo(() => getDoctorColumns(role === "admin"), [role]);

  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch = query
        ? [
            doctor.name,
            doctor.id,
            doctor.specialty,
            doctor.department,
            doctor.contact,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      const matchesDepartment = department
        ? doctor.department === department
        : true;

      const matchesStatus = status ? doctor.status === status : true;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [department, doctors, search, status]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedData = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DataTable<Doctor>
      title="Doctor Directory"
      description="Browse our medical staff by specialty and department."
      data={paginatedData}
      columns={doctorColumns}
      filters={{
        search: {
          value: search,
          placeholder: "Search doctors...",
          onChange: handleSearchChange,
        },
        selects: [
          {
            id: "department",
            value: department,
            placeholder: "Department",
            options: departmentOptions,
            onChange: handleDepartmentChange,
            widthClassName: "!min-w-[120px] max-w-fit",
          },
          {
            id: "status",
            value: status,
            placeholder: "Status",
            options: [
              { label: "Active", value: "Active" },
              { label: "On Leave", value: "On Leave" },
              { label: "Unavailable", value: "Unavailable" },
            ],
            onChange: handleStatusChange,
            widthClassName: "min-w-[120px] max-w-fit",
          },
        ],
        onReset: () => {
          setSearch("");
          setDepartment("");
          setStatus("");
        },
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
      totalItems={doctorsData?.meta.total}
    />
  );
}
