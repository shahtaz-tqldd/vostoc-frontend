import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { useGetAppointmentsQuery } from "@/features/appointment/appointmentApiSlice";
import { formatDateForApi } from "@/lib/time";
import { DataTable, type ColumnDef } from "@/components/table";
import { useAppSelector } from "@/app/hooks";
import { selectDepartmentFilterOptions } from "@/features/department/departmentSlice";

// types
type AppointmentRow = {
  id: string;
  patient: string;
  patientAge: number | null;
  patientGender: string | null;
  doctor:
    | {
        id: string;
        name: string;
        image_url?: string;
        department?: { name?: string };
        specialty?: { name?: string };
      }
    | undefined;
  time: string;
  contact: string | null;
  status: string;
};

export default function TodaysAppointmentQueue() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);

  const {
    data,
    isLoading: isAppointmentLoading,
    isError,
  } = useGetAppointmentsQuery({
    pageSize: itemsPerPage,
    startDate: formatDateForApi(new Date()),
    endDate: formatDateForApi(new Date()),
    departmentId: department || undefined,
    search: search || undefined,
  });

  const rows = useMemo<AppointmentRow[]>(
    () =>
      (data?.data || []).map((item) => ({
        id: item.id,
        patient: item.patientName || "Unknown patient",
        patientAge: item.patientAge ?? null,
        patientGender: item.patientGender ?? null,
        contact: item.patientPhone ?? null,
        doctor: item.doctor,
        time: item.appointmentTime || "N/A",
        status: item?.status || "unknown",
      })),
    [data],
  );

  const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
      header: "Patient",
      accessorKey: "patient",
      cell: (row) => {
        return (
          <div>
            <h2>{row.patient}</h2>
            <p className="text-xs opacity-60">
              Age: {row.patientAge || "N/A"} • {row.patientGender || "N/A"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Contact",
      accessorKey: "contact",
    },
    {
      header: "Assigned Doctor",
      accessorKey: "doctor",
      cell: (row) => {
        return (
          <div>
            <h2>{row.doctor?.name || "Unassigned"}</h2>
            <p className="text-xs opacity-60">
              {row.doctor?.department?.name || "No Department"} •{" "}
              {row.doctor?.specialty?.name || "No Specialization"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Time Slot",
      accessorKey: "time",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const statusToVariant = {
          new: "success",
          "follow-up": "pending",
        } as const;
        const variant =
          statusToVariant[row.status as keyof typeof statusToVariant] ??
          "disabled";

        return <StatusBadge status={variant} label={row.status} />;
      },
    },
  ];

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  if (isAppointmentLoading) return <div>Loading appointments...</div>;
  if (isError) return <div>Failed to load appointments.</div>;

  return (
    <>
      <DataTable<AppointmentRow>
        title="Today's Appointment"
        description="32 Booking in 4 Doctors"
        data={rows}
        columns={appointmentColumns}
        filters={{
          search: {
            value: search,
            placeholder: "Search appointments...",
            onChange: handleSearchChange,
          },
          selects: [
            {
              id: "department",
              value: department,
              placeholder: "Department",
              options: departmentOptions,
              onChange: setDepartment,
              widthClassName: "!min-w-[120px] max-w-fit",
            },
          ],
          onReset: () => {
            setSearch("");
            setCurrentPage(1);
            setDepartment("");
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={rows.length}
      />
    </>
  );
}
