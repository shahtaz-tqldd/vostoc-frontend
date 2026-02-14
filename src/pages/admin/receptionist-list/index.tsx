import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  Receptionist,
  ReceptionistStatus,
} from "@/features/receptionist/type";
import { useGetReceptionistsQuery } from "@/features/receptionist/receptionistApi";
import { useAppSelector } from "@/app/hooks";
import { selectDepartmentFilterOptions } from "@/features/department/departmentSlice";

const receptionistColumns: ColumnDef<Receptionist>[] = [
  {
    header: "Receptionist",
    accessorKey: "name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
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
    header: "Department",
    accessorKey: "department",
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
    header: "Today",
    accessorKey: "todaysAppointments",
    cell: (row) => (
      <span className="text-sm font-semibold">{row.todaysAppointments}</span>
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
];

export default function ReceptionistListPage() {
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const statusOptions = useMemo(
    () =>
      (["Active", "On Break", "Off Duty"] as ReceptionistStatus[]).map((s) => ({
        label: s,
        value: s,
      })),
    [],
  );

  const { data: receptionistData } = useGetReceptionistsQuery({
    search: search || undefined,
    department: department || undefined,
    status: status || undefined,
    page: currentPage,
    pageSize: itemsPerPage,
  });

  const receptionists = useMemo<Receptionist[]>(() => {
    if (!receptionistData?.data) {
      return [];
    }

    return receptionistData.data.map((receptionist) => ({
      ...receptionist,
      department:
        typeof receptionist.department === "string"
          ? receptionist.department
          : (receptionist.department?.name ?? "—"),
      contact: receptionist.contactNumber ?? "—",
      status: receptionist.status ?? "Active",
      profile_image_url: receptionist.profile_image_url ?? "",
      todaysAppointments: receptionist.todaysAppointments ?? 0,
    }));
  }, [receptionistData]);

  const totalItems = receptionistData?.meta?.total ?? 0;
  const effectivePageSize = receptionistData?.meta?.pageSize ?? itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);

  return (
    <DataTable<Receptionist>
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
          {
            id: "status",
            value: status,
            placeholder: "Status",
            options: statusOptions,
            onChange: (v) => {
              setStatus(v);
              setCurrentPage(1);
            },
            widthClassName: "!min-w-[120px] max-w-fit",
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
      totalPages={Math.max(1, totalPages)}
      setCurrentPage={setCurrentPage}
    />
  );
}
