import moment from "moment";
import { useCallback, useMemo, useState } from "react";

// components
import { DataTable, type ColumnDef } from "@/components/table";

import DeleteDialog from "@/components/layout/DeleteDialog";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";
import { StatusBadge } from "@/components/ui/badge";
import UpsertAppointmentDialog, {
  type UpsertAppointmentInitialData,
} from "./upsert-appointment-dialog";

// hooks and services
import {
  useDeleteAppointmentMutation,
  useGetAppointmentsQuery,
} from "@/features/appointment/appointmentApiSlice";
import { selectDepartmentFilterOptions } from "@/features/department/departmentSlice";
import { useAppSelector } from "@/app/hooks";

// icons
import { Eye, Pencil, Trash2 } from "lucide-react";
import AppointmentDetailsDrawer from "./appointment-details-drawer";
import ProfileItem from "@/components/layout/ProfileItem";

export interface AppointmentRow {
  id: string;
  patient: string;
  patientAge: number | null;
  patientGender: string | null;
  patientPhone: string | null;
  doctor:
    | {
        id: string;
        name: string;
        profileImageUrl?: string;
        department?: { id?: string; name?: string };
        specialty?: { name?: string };
      }
    | undefined;
  doctorId: string;
  departmentId: string;
  time: string;
  rawDate: string;
  date: string;
  status: string;
  previousAppointment?: Record<string, unknown> | null;
}

export default function AppointmentListPage() {
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [viewingAppointment, setViewingAppointment] =
    useState<AppointmentRow | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<UpsertAppointmentInitialData | null>(null);

  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);

  const {
    data,
    isLoading: isAppointmentLoading,
    isFetching: isAppointmentFetching,
    isError,
  } = useGetAppointmentsQuery({
    search,
    startDate: selectedDate || undefined,
    endDate: selectedDate || undefined,
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
        patientPhone: item.patientPhone || null,
        doctor: item.doctor,
        doctorId: item.doctor?.id || "",
        departmentId: item.doctor?.department?.id || "",
        time: item.appointmentTime || "N/A",
        rawDate: item.appointmentDate
          ? moment(item.appointmentDate).format("YYYY-MM-DD")
          : "",
        date: item.appointmentDate
          ? `${moment(item.appointmentDate).format("DD MMM YYYY")} • ${moment(
              item.appointmentDate,
            ).format("dddd")}`
          : "N/A",
        status: item.appointmentStatus || "unknown",
        previousAppointment: item.previousAppointment ?? null,
      })),
    [data],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setSelectedAppointmentId(id);
  }, []);

  const handleOpenViewDrawer = useCallback((row: AppointmentRow) => {
    setViewingAppointment(row);
  }, []);

  const handleOpenUpdateDialog = useCallback((row: AppointmentRow) => {
    setEditingAppointment({
      id: row.id,
      patientName: row.patient,
      patientPhone: row.patientPhone ?? "",
      patientAge: row.patientAge ?? undefined,
      patientGender: row.patientGender ?? undefined,
      departmentId: row.departmentId,
      doctorId: row.doctorId,
      appointmentDate: row.rawDate,
      appointmentTime: row.time !== "N/A" ? row.time : "",
      status: row.status,
      previousAppointment: row.previousAppointment ?? null,
    });
  }, []);

  const handleDeleteAppointment = async () => {
    if (!selectedAppointmentId) return;
    await deleteAppointment(selectedAppointmentId).unwrap();
    setSelectedAppointmentId(null);
  };

  const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
      header: "Patient",
      accessorKey: "patient",
      cell: (row) => {
        return (
          <ProfileItem
            title={row.patient}
            subtitle={`Age: ${row.patientAge || "N/A"} • ${
              row.patientGender || "N/A"
            }`}
            link={`/patients/${row.id}`}
          />
        );
      },
    },
    {
      header: "Contact",
      accessorKey: "patientPhone",
      cell: (row) => row.patientPhone || "N/A",
    },
    {
      header: "Assigned Doctor",
      accessorKey: "doctor",
      cell: (row) => {
        return (
          <ProfileItem
            title={row.doctor?.name || "Unassigned"}
            image_url={row.doctor?.profileImageUrl}
            subtitle={`${row.doctor?.department?.name || "No Department"} • ${row.doctor?.specialty?.name || "No Specialization"}`}
            link={`/doctors/${row.doctorId}`}
          />
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
          completed: "success",
          cancelled: "failed",
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
              onClick: () => handleOpenViewDrawer(row),
            },
            {
              label: "Update",
              icon: Pencil,
              onClick: () => handleOpenUpdateDialog(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              destructive: true,
              disabled: isDeletingAppointment,
              onClick: () => handleOpenDeleteDialog(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable<AppointmentRow>
        title="Appointment Queue"
        description="Bookings grouped by assigned doctor and time slot."
        data={rows}
        columns={appointmentColumns}
        filters={{
          search: {
            value: search,
            placeholder: "Search appointments...",
            onChange: (value) => {
              setSearch(value);
              setCurrentPage(1);
            },
          },
          date: {
            id: "appointment-date",
            value: selectedDate,
            onChange: (value) => {
              setSelectedDate(value);
              setCurrentPage(1);
            },
            widthClassName: "!w-[180px]",
          },
          onReset: () => {
            setSearch("");
            setSelectedDate("");
            setCurrentPage(1);
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={rows.length}
        isLoading={isAppointmentLoading || isAppointmentFetching}
      />
      {isError && (
        <p className="mt-3 text-sm text-red-600">
          Failed to load appointments. Please retry.
        </p>
      )}

      <UpsertAppointmentDialog
        key={editingAppointment?.id ?? "update-closed"}
        open={Boolean(editingAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAppointment(null);
          }
        }}
        departmentOptions={departmentOptions}
        initialData={editingAppointment}
      />

      <AppointmentDetailsDrawer
        viewingAppointment={viewingAppointment}
        setViewingAppointment={setViewingAppointment}
      />

      <DeleteDialog
        title="Delete appointment"
        open={Boolean(selectedAppointmentId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentId(null);
          }
        }}
        onConfirm={handleDeleteAppointment}
        isLoading={isDeletingAppointment}
      />
    </>
  );
}
