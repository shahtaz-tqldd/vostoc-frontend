import { useCallback, useMemo, useState } from "react";

// components
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// hooks and services
import type { Receptionist } from "@/features/receptionist/type";
import {
  useDeleteReceptionistMutation,
  useGetReceptionistsQuery,
} from "@/features/receptionist/receptionistApi";
import { useAppSelector } from "@/app/hooks";
import {
  selectDepartmentFilterOptions,
  selectDepartments,
} from "@/features/department/departmentSlice";

// icons
import { CheckCircle, Eye, Pencil, Trash2 } from "lucide-react";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";
import DeleteDialog from "@/components/layout/DeleteDialog";
import UpsertReceptionistDialog, {
  type UpsertReceptionistInitialData,
} from "./upsert-receptionist-dialog";

type DepartmentRef = {
  id?: string;
  name?: string;
};

type ReceptionistRow = Receptionist & {
  department: DepartmentRef[];
  contact: string;
  actions: string;
};

const DepartmentAccessCell = ({
  departments,
  totalDepartmentCount,
}: {
  departments: DepartmentRef[];
  totalDepartmentCount: number;
}) => {
  const names = departments
    .map((department) => department.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return <span className="text-sm font-medium text-muted-foreground">-</span>;
  }

  if (totalDepartmentCount > 0 && names.length === totalDepartmentCount) {
    return (
      <span className="text-sm font-medium text-emerald-600">
        <CheckCircle className="inline h-4 w-4 mr-2" />
        All Department
      </span>
    );
  }

  const visibleNames = names.slice(0, 3);
  const remainingNames = names.slice(3);

  return (
    <span className="text-sm font-medium text-muted-foreground">
      {visibleNames.join(", ")}
      {remainingNames.length > 0 ? (
        <>
          {" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex cursor-default items-center text-primary"
                >
                  +{remainingNames.length}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-0.5">
                  {remainingNames.map((name) => (
                    <p key={name}>{name}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      ) : null}
    </span>
  );
};

const getReceptionistColumns = (
  totalDepartmentCount: number,
  onView: (row: ReceptionistRow) => void,
  onUpdate: (row: ReceptionistRow) => void,
  onDelete: (id: string) => void,
): ColumnDef<ReceptionistRow>[] => [
  {
    header: "Receptionist",
    accessorKey: "name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={row.profile_image_url} alt={row.name} />
          <AvatarFallback>
            {row.name.split(" ")[1]?.charAt(0) || row.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-base">{row.name}</div>
          <div className="text-sm text-muted-foreground uppercase">
            rec-{row.id.slice(-4)}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: "Contact",
    accessorKey: "contact",
  },
  {
    header: "Shift",
    accessorKey: "shift",
    cell: (row) => (
      <span className="text-sm font-medium text-muted-foreground">
        {row.shift}
      </span>
    ),
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: (row) => (
      <DepartmentAccessCell
        departments={row.department}
        totalDepartmentCount={totalDepartmentCount}
      />
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const variant = {
        Active: "success",
        "On Break": "disabled",
        "Off Duty": "failed",
      }[row.status] as "success" | "disabled" | "failed";

      return <StatusBadge status={variant} label={row.status} />;
    },
  },
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

export default function ReceptionistListPage() {
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceptionistId, setSelectedReceptionistId] = useState<
    string | null
  >(null);
  const [viewingReceptionist, setViewingReceptionist] =
    useState<ReceptionistRow | null>(null);
  const [editingReceptionist, setEditingReceptionist] =
    useState<UpsertReceptionistInitialData | null>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [deleteReceptionist, { isLoading: isDeleting }] =
    useDeleteReceptionistMutation();

  const { data: receptionistData } = useGetReceptionistsQuery({
    search: search || undefined,
    departmentId: department || undefined,
    page: currentPage,
    pageSize: itemsPerPage,
  });

  const receptionists = useMemo<ReceptionistRow[]>(() => {
    if (!receptionistData?.data) {
      return [];
    }

    return receptionistData.data.map((receptionist) => ({
      ...(receptionist as Receptionist),
      department:
        (
          receptionist as Receptionist & {
            departments?: DepartmentRef[];
          }
        )?.departments || [],
      contact: receptionist.contactNumber ?? "—",
      status: receptionist.status ?? "Active",
      profile_image_url: receptionist.profile_image_url ?? "",
      actions: "",
    }));
  }, [receptionistData]);

  const totalItems = receptionistData?.meta?.total ?? 0;
  const effectivePageSize = receptionistData?.meta?.pageSize ?? itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);
  const totalDepartmentCount = useAppSelector(selectDepartments).length;

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setSelectedReceptionistId(id);
  }, []);

  const handleOpenViewDrawer = useCallback((row: ReceptionistRow) => {
    setViewingReceptionist(row);
  }, []);

  const handleOpenUpdateDialog = useCallback((row: ReceptionistRow) => {
    setEditingReceptionist({
      id: row.id,
      name: row.name,
      username: row.username,
      profileImageUrl: row.profile_image_url ?? "",
      departments: row.department
        .map((dep) => dep.id)
        .filter((id): id is string => Boolean(id)),
      contactNumber: row.contactNumber,
      shift: row.shift,
      description: row.description,
    });
  }, []);

  const receptionistColumns = useMemo(
    () =>
      getReceptionistColumns(
        totalDepartmentCount,
        handleOpenViewDrawer,
        handleOpenUpdateDialog,
        handleOpenDeleteDialog,
      ),
    [
      handleOpenDeleteDialog,
      handleOpenUpdateDialog,
      handleOpenViewDrawer,
      totalDepartmentCount,
    ],
  );

  const handleDeleteReceptionist = async () => {
    if (!selectedReceptionistId) return;
    await deleteReceptionist(selectedReceptionistId).unwrap();
    setSelectedReceptionistId(null);
  };

  return (
    <>
      <DataTable<ReceptionistRow>
        title="Receptionist List"
        description="Manage receptionist staff, shifts, and daily appointment load."
        data={receptionists}
        columns={receptionistColumns}
        totalItems={totalItems}
        filters={{
          search: {
            value: search,
            placeholder: "Search receptionist by name",
            onChange: (v) => {
              setSearch(v);
              setCurrentPage(1);
            },
          },
          selects: [
            {
              id: "department",
              value: department,
              placeholder: "Department",
              options: departmentOptions,
              onChange: (v) => {
                setDepartment(v);
                setCurrentPage(1);
              },
              widthClassName: "!min-w-[140px] max-w-fit",
            },
          ],
          onReset: () => {
            setSearch("");
            setDepartment("");
            setCurrentPage(1);
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={Math.max(1, totalPages)}
        setCurrentPage={setCurrentPage}
      />
      <UpsertReceptionistDialog
        key={editingReceptionist?.id ?? "update-closed"}
        open={Boolean(editingReceptionist)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingReceptionist(null);
          }
        }}
        departmentOptions={departmentOptions}
        initialData={editingReceptionist}
      />
      <Drawer
        open={Boolean(viewingReceptionist)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingReceptionist(null);
          }
        }}
      >
        <DrawerContent className="max-w-xl p-0">
          <div className="h-full overflow-y-auto">
            {viewingReceptionist ? (
              <>
                <DrawerHeader className="mb-4 p-0">
                  <DrawerTitle className="hidden"></DrawerTitle>
                  <DrawerDescription className="hidden"></DrawerDescription>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={viewingReceptionist.profile_image_url}
                        alt={viewingReceptionist.name}
                      />
                      <AvatarFallback>
                        {viewingReceptionist.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {viewingReceptionist.name}
                      </p>
                      <p className="text-xs text-slate-500 uppercase">
                        rec-{viewingReceptionist.id.slice(-4)}
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
                          {viewingReceptionist.contact || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Shift</p>
                        <p className="font-medium text-slate-900">
                          {viewingReceptionist.shift}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="font-medium text-slate-900">
                          {viewingReceptionist.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Username</p>
                        <p className="font-medium text-slate-900">
                          {viewingReceptionist.username || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-slate-500 text-sm">Departments</p>
                      <p className="font-medium text-slate-900 text-sm">
                        {viewingReceptionist.department.length > 0
                          ? viewingReceptionist.department
                              .map((dep) => dep.name)
                              .filter((name): name is string => Boolean(name))
                              .join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Activity Logs
                    </h3>
                    <div className="mt-2 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                      No activity logs yet.
                    </div>
                  </section>
                </div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
      <DeleteDialog
        title="Delete receptionist"
        open={Boolean(selectedReceptionistId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReceptionistId(null);
          }
        }}
        onConfirm={handleDeleteReceptionist}
        isLoading={isDeleting}
      />
    </>
  );
}
