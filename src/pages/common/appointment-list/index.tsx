import moment from "moment";
import { useCallback, useMemo, useState } from "react";

// components
import { DataTable, type ColumnDef } from "@/components/table";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

type AppointmentRow = {
  id: string;
  patient: string;
  patientAge: number | null;
  patientGender: string | null;
  patientPhone: string | null;
  doctor:
    | {
        id: string;
        name: string;
        image_url?: string;
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
};

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
        status: item.status || "unknown",
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
      accessorKey: "patientPhone",
      cell: (row) => row.patientPhone || "N/A",
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

      <Drawer
        open={Boolean(viewingAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingAppointment(null);
          }
        }}
      >
        <DrawerContent className="max-w-xl p-0">
          <div className="h-full overflow-y-auto">
            {viewingAppointment ? (
              <>
                <DrawerHeader className="mb-4 p-0">
                  <DrawerTitle className="hidden"></DrawerTitle>
                  <DrawerDescription className="hidden"></DrawerDescription>

                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {viewingAppointment.patient}
                    </p>
                    <p className="text-xs uppercase text-slate-500">
                      app-{viewingAppointment.id.slice(-6)}
                    </p>
                  </div>
                </DrawerHeader>

                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Contact</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.patientPhone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Patient details</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.patientAge || "N/A"} •{" "}
                          {viewingAppointment.patientGender || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Doctor</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.doctor?.name || "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Department</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.doctor?.department?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Date</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Time</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="font-medium text-slate-900">
                          {viewingAppointment.status}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

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
