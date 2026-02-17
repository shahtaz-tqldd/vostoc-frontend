import { useCallback, useMemo, useState } from "react";

// components
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";
import DeleteDialog from "@/components/layout/DeleteDialog";
import UpsertDoctorDialog, {
  type UpsertDoctorInitialData,
} from "./upsert-doctor-dialog";

// hooks and services
import type { DoctorDetails, DoctorSchedule } from "@/features/doctors/type";
import { formatDay, weekDayFromCode } from "@/lib/time";
import { useAppSelector } from "@/app/hooks";
import {
  selectDepartmentFilterOptions,
  selectDepartmentOptionsWithSpecialties,
} from "@/features/department/departmentSlice";
import {
  useDeleteDoctorMutation,
  useGetDoctorsQuery,
} from "@/features/doctors/doctorsApi";

// icons
import { CalendarDays, Clock3, Eye, Pencil, Trash2 } from "lucide-react";


type DoctorRow = {
  id: string;
  name: string;
  username?: string;
  specialty: string;
  specialtyValue: string;
  department: string;
  departmentId: string;
  contact: string;
  contactNumber: string;
  status: "Active" | "On Leave" | "Unavailable";
  imageUrl: string;
  description?: string;
  schedules: DoctorSchedule[];
  scheduleDisplay: string;
  actions: string;
};

const getDoctorColumns = (
  isAdmin: boolean,
  onView: (row: DoctorRow) => void,
  onUpdate: (row: DoctorRow) => void,
  onDelete: (id: string) => void,
): ColumnDef<DoctorRow>[] => {
  const baseColumns: ColumnDef<DoctorRow>[] = [
    {
      header: "Doctor",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={row.imageUrl} alt={row.name} />
            <AvatarFallback>
              {row.name.split(" ")[1]?.charAt(0) || row.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-medium">{row.name}</div>
            <div className="text-sm uppercase text-muted-foreground">
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
                onView(row);
              },
            },
            {
              label: "Update",
              icon: Pencil,
              onClick: () => {
                onUpdate(row);
              },
            },
            {
              label: "Delete",
              icon: Trash2,
              destructive: true,
              onClick: () => {
                onDelete(row.id);
              },
            },
          ]}
        />
      ),
    },
  ];
};

const mapDoctorToRow = (doctor: DoctorDetails): DoctorRow => ({
  id: doctor.id,
  name: doctor.name,
  username: (doctor as DoctorDetails & { username?: string }).username,
  specialty: doctor.specialty?.name ?? "—",
  specialtyValue: doctor.specialty?.name ?? "",
  department: doctor.department?.name ?? "—",
  departmentId: doctor.departmentId ?? "",
  contact: doctor.contactNumber ?? "—",
  contactNumber: doctor.contactNumber ?? "",
  status: "Active",
  imageUrl: doctor.profileImageUrl ?? "",
  description: doctor.description,
  schedules: doctor.schedules ?? [],
  scheduleDisplay: `${doctor.schedules?.length ?? 0} schedules`,
  actions: "",
});

const mapSchedulesForForm = (schedules: DoctorSchedule[]) => {
  return schedules.reduce<
    Record<string, Array<{ id: string; startTime: string; endTime: string }>>
  >((acc, slot) => {
    const day = weekDayFromCode[slot.day.toUpperCase()];
    if (!day) {
      return acc;
    }

    if (!acc[day]) {
      acc[day] = [];
    }

    acc[day].push({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    return acc;
  }, {});
};

export default function DoctorListPage() {
  const itemsPerPage = 10;

  const role = useAppSelector((state) => state.auth.role);
  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);
  const departmentOptionsWithSpecialties = useAppSelector(
    selectDepartmentOptionsWithSpecialties,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<DoctorRow | null>(null);
  const [editingDoctor, setEditingDoctor] =
    useState<UpsertDoctorInitialData | null>(null);

  const { data: doctorsData, isLoading, isFetching } = useGetDoctorsQuery();
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  const doctors = useMemo<DoctorRow[]>(() => {
    if (!doctorsData?.data) {
      return [];
    }

    return doctorsData.data.map(mapDoctorToRow);
  }, [doctorsData]);

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setSelectedDoctorId(id);
  }, []);

  const handleOpenViewDrawer = useCallback((row: DoctorRow) => {
    setViewingDoctor(row);
  }, []);

  const handleOpenUpdateDialog = useCallback((row: DoctorRow) => {
    setEditingDoctor({
      id: row.id,
      name: row.name,
      username: row.username,
      profileImageUrl: row.imageUrl,
      departmentId: row.departmentId,
      specialty: row.specialtyValue,
      contactNumber: row.contactNumber,
      description: row.description,
      schedule: mapSchedulesForForm(row.schedules),
    });
  }, []);

  const doctorColumns = useMemo(
    () =>
      getDoctorColumns(
        role === "admin",
        handleOpenViewDrawer,
        handleOpenUpdateDialog,
        handleOpenDeleteDialog,
      ),
    [
      role,
      handleOpenDeleteDialog,
      handleOpenUpdateDialog,
      handleOpenViewDrawer,
    ],
  );

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
        ? doctor.departmentId === department
        : true;

      const matchesStatus = status ? doctor.status === status : true;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [department, doctors, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = filteredDoctors.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleDeleteDoctor = async () => {
    if (!selectedDoctorId) return;
    await deleteDoctor(selectedDoctorId).unwrap();
    setSelectedDoctorId(null);
  };

  return (
    <>
      <DataTable<DoctorRow>
        title="Doctor Directory"
        description="Browse our medical staff by specialty and department."
        data={paginatedData}
        columns={doctorColumns}
        filters={{
          search: {
            value: search,
            placeholder: "Search doctors...",
            onChange: (value) => {
              setSearch(value);
              setCurrentPage(1);
            },
          },
          selects: [
            {
              id: "department",
              value: department,
              placeholder: "Department",
              options: departmentOptions,
              onChange: (value) => {
                setDepartment(value);
                setCurrentPage(1);
              },
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
              onChange: (value) => {
                setStatus(value);
                setCurrentPage(1);
              },
              widthClassName: "min-w-[120px] max-w-fit",
            },
          ],
          onReset: () => {
            setSearch("");
            setDepartment("");
            setStatus("");
            setCurrentPage(1);
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={filteredDoctors.length}
        isLoading={isLoading || isFetching}
      />

      <UpsertDoctorDialog
        key={editingDoctor?.id ?? "update-closed"}
        open={Boolean(editingDoctor)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDoctor(null);
          }
        }}
        departmentOptions={departmentOptionsWithSpecialties}
        initialData={editingDoctor}
      />

      <Drawer
        open={Boolean(viewingDoctor)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingDoctor(null);
          }
        }}
      >
        <DrawerContent className="max-w-xl p-0">
          <div className="h-full overflow-y-auto">
            {viewingDoctor ? (
              <>
                <DrawerHeader className="mb-4 p-0">
                  <DrawerTitle className="hidden"></DrawerTitle>
                  <DrawerDescription className="hidden"></DrawerDescription>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={viewingDoctor.imageUrl}
                        alt={viewingDoctor.name}
                      />
                      <AvatarFallback>
                        {viewingDoctor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {viewingDoctor.name}
                      </p>
                      <p className="text-xs uppercase text-slate-500">
                        doc-{viewingDoctor.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                </DrawerHeader>

                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Contact</p>
                        <p className="font-medium text-slate-900">
                          {viewingDoctor.contact || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Department</p>
                        <p className="font-medium text-slate-900">
                          {viewingDoctor.department || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Specialty</p>
                        <p className="font-medium text-slate-900">
                          {viewingDoctor.specialty || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="font-medium text-slate-900">
                          {viewingDoctor.status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Description</p>
                      <p className="text-sm font-medium text-slate-900">
                        {viewingDoctor.description || "N/A"}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Weekly Schedule
                    </h3>
                    <div className="mt-2 space-y-2 rounded-xl border border-dashed border-slate-300 p-4">
                      {viewingDoctor.schedules.length > 0 ? (
                        viewingDoctor.schedules.map((slot) => (
                          <p key={slot.id} className="text-sm text-slate-600">
                            {formatDay(slot.day)}: {slot.startTime} -{" "}
                            {slot.endTime}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No schedule set.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteDialog
        title="Delete doctor"
        open={Boolean(selectedDoctorId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDoctorId(null);
          }
        }}
        onConfirm={handleDeleteDoctor}
        isLoading={isDeleting}
      />
    </>
  );
}

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
