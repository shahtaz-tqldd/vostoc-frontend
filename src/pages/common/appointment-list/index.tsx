import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import {
  useDeleteAppointmentMutation,
  useGetAppointmentsQuery,
} from "@/features/appointment/appointmentApiSlice";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import moment from "moment";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";

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
  date: string;
  contact: string | null;
  status: string;
};

export default function AppointmentListPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState();

  const {
    data,
    isLoading: isAppointmentLoading,
    isFetching: isAppointmentFetching,
    isError,
  } = useGetAppointmentsQuery({
    search: search,
    startDate: selectedDate,
    endDate: selectedDate,
    pageSize: itemsPerPage,
  });

  const [deleteAppointment, { isLoading: isDeletingAppointment }] =
    useDeleteAppointmentMutation();

  const rows = useMemo<AppointmentRow[]>(
    () =>
      (data?.data || []).map((item) => ({
        id: item.id,
        patient: item.patientName || "Unknown patient",
        patientAge: item.patientAge || null,
        patientGender: item.patientGender || null,
        contact: item.patientPhone || null,
        doctor: item.doctor,
        time: item.appointmentTime || "N/A",
        date: item.appointmentDate
          ? `${moment(item.appointmentDate).format("DD MMM YYYY")} • ${moment(item.appointmentDate).format("dddd")}`
          : "N/A",
        status: item?.status || "unknown",
      })),
    [data],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id).unwrap();
    } catch {
      // Keep the UI stable; global error handling can show details.
    }
  };

  const handleViewAppointment = (id: string) => {
    console.log(`View appointment ${id}`);
  };

  const handleUpdateAppointment = (id: string) => {
    console.log(`Update appointment ${id}`);
  };

  const handleDownloadReport = (id: string) => {
    console.log(`Download appointment report ${id}`);
  };

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
      header: "Date",
      accessorKey: "date",
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
    {
      header: "Action",
      accessorKey: "id",
      cell: (row) => (
        <ThreeDotMenu
          items={[
            {
              label: "View",
              icon: Eye,
              onClick: () => handleViewAppointment(row.id),
            },
            {
              label: "Update",
              icon: Pencil,
              onClick: () => handleUpdateAppointment(row.id),
            },
            {
              label: "Delete",
              icon: Trash2,
              destructive: true,
              disabled: isDeletingAppointment,
              onClick: () => handleDeleteAppointment(row.id),
            },
            {
              label: "Download Report",
              icon: Download,
              onClick: () => handleDownloadReport(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <DataTable<AppointmentRow>
        title="Appointment Queue"
        description="Bookings grouped by assigned doctor and time slot."
        data={rows}
        columns={appointmentColumns}
        filters={{
          search: {
            value: search,
            placeholder: "Search appointments...",
            onChange: handleSearchChange,
          },
          date: {
            id: "appointment-date",
            value: selectedDate,
            onChange: handleDateChange,
            widthClassName: "!w-[180px]",
          },
          onReset: () => {
            setSearch("");
            setSelectedDate(undefined);
            setCurrentPage(1);
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={rows.length}
      />
      {(isAppointmentLoading || isAppointmentFetching) && (
        <p className="mt-3 text-sm text-ink-500">Loading appointments...</p>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-600">
          Failed to load appointments. Please retry.
        </p>
      )}
    </div>
  );
}
