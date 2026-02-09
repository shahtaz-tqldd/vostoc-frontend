import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDeleteAppointmentMutation,
  useGetAppointmentsQuery,
} from "@/features/appointment/appointmentApiSlice";
import type { AppointmentDetails } from "@/features/appointment/type";
import { Trash2 } from "lucide-react";

type AppointmentRow = {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "Pending";
};

const formatTimeSlot = (item: AppointmentDetails) => {
  if (item.appointmentTime) return item.appointmentTime;
  if (!item.appointmentDate) return "N/A";
  const dateValue = new Date(item.appointmentDate);
  if (Number.isNaN(dateValue.getTime())) return "N/A";
  return dateValue.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapApiStatus = (status?: string): AppointmentRow["status"] => {
  const normalized = status?.toLowerCase();
  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "pending") return "Pending";
  return "Scheduled";
};

export default function AppointmentListPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading: isAppointmentLoading,
    isFetching: isAppointmentFetching,
    isError,
  } = useGetAppointmentsQuery();
  const [deleteAppointment, { isLoading: isDeletingAppointment }] =
    useDeleteAppointmentMutation();

  const rows = useMemo<AppointmentRow[]>(
    () =>
      (data?.data || []).map((item) => ({
        id: item.id,
        patient: item.patientName || "Unknown patient",
        doctor: item.doctor?.name || "Unassigned",
        time: formatTimeSlot(item),
        status: mapApiStatus(item.status),
      })),
    [data],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = rows.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id).unwrap();
    } catch {
      // Keep the UI stable; global error handling can show details.
    }
  };

  const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
      header: "Appointment ID",
      accessorKey: "id",
    },
    {
      header: "Patient Name",
      accessorKey: "patient",
    },
    {
      header: "Assigned Doctor",
      accessorKey: "doctor",
    },
    {
      header: "Time Slot",
      accessorKey: "time",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const variant =
          row.status === "Completed"
            ? "ink"
            : row.status === "Cancelled"
              ? "coral"
              : row.status === "Pending"
                ? "coral"
                : "mint";
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteAppointment(row.id)}
          disabled={isDeletingAppointment}
          className="rounded-md px-2 text-red-600 hover:text-red-700"
        >
          <Trash2 size={14} />
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <DataTable<AppointmentRow>
        title="Appointment Queue"
        description="Bookings grouped by assigned doctor and time slot."
        data={paginatedData}
        columns={appointmentColumns}
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
