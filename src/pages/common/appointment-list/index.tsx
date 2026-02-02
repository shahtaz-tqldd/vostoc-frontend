import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

// --- 2. Create some mock data ---
const mockAppointments: Appointment[] = Array.from({ length: 55 }, (_, i) => ({
  id: `APT-${1000 + i}`,
  patient: `Patient ${i + 1}`,
  doctor: `Dr. ${String.fromCharCode(65 + (i % 5))}. Smith`,
  time: `${9 + (i % 9)}:${(i % 6) * 10} AM`,
  status: ["Scheduled", "Completed", "Cancelled"][
    i % 3
  ] as Appointment["status"],
}));

// --- 3. Define the columns for your table ---
// This is where you configure how the table is rendered.
const appointmentColumns: ColumnDef<Appointment>[] = [
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
    // Use the `cell` property for custom rendering
    cell: (row) => {
      const status = row.status;
      const variant = {
        Scheduled: "mint",
        Completed: "ink",
        Cancelled: "coral",
      }[status] as "mint" | "ink" | "coral";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export default function AppointmentListPage() {
  // --- 4. Manage pagination state in the parent component ---
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockAppointments.length / itemsPerPage);
  const paginatedData = mockAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container mx-auto">
      <DataTable<Appointment>
        title="Appointment Queue"
        description="Bookings grouped by assigned doctor and time slot."
        data={paginatedData}
        columns={appointmentColumns}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
