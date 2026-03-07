import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { useGetDoctorsPatientListQuery } from "@/features/doctors/doctorsApi";
import type { DoctorPatient } from "@/features/doctors/type";
import moment from "moment";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  patientPhone: string;
  lastVisit: string;
  condition: string;
  status: string;
};

// --- Table columns ---
const patientColumns: ColumnDef<Patient>[] = [
  {
    header: "Patient Name",
    accessorKey: "name",
    cell: (row) => {
      return (
        <div>
          <h2>{row.name}</h2>
          <p className="text-xs opacity-60">
            Age: {row.age || "N/A"} • {row.gender || "N/A"}
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
    header: "Last Visit",
    accessorKey: "lastVisit",
    cell: (row) => {
      const visitTime = moment(row.lastVisit, "YYYY-MM-DD HH:mm", true);
      return visitTime.isValid()
        ? visitTime.format("MMM D, YYYY • h:mm A")
        : "N/A";
    },
  },
  { header: "Condition", accessorKey: "condition" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const statusToVariant = {
        active: "success",
        "follow-up": "pending",
        discharged: "failed",
      } as const;
      const normalizedStatus = row.status.toLowerCase();
      const variant =
        statusToVariant[normalizedStatus as keyof typeof statusToVariant] ??
        "disabled";

      return <StatusBadge status={variant} label={toStatusLabel(row.status)} />;
    },
  },
];

function toStatusLabel(status: string) {
  if (!status) return "Unknown";
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function phoneToId(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `PT-${digits.slice(-6) || "000000"}`;
}

const MyPatientList = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useGetDoctorsPatientListQuery({
    page: currentPage,
    pageSize: itemsPerPage,
    search: search || undefined,
    status: status || undefined,
  });

  const mappedPatients = useMemo<Patient[]>(() => {
    const list = data?.data ?? [];

    return list.map((p: DoctorPatient) => ({
      id: phoneToId(p.patientPhone),
      name: p.name,
      age: p.age,
      gender: p.gender,
      patientPhone: p.patientPhone,
      lastVisit: p.lastVisit,
      condition:
        p.conditions && p.conditions.length > 0 ? p.conditions[0] : "—",
      status: p.status,
    }));
  }, [data?.data]);

  // Pagination Data
  const totalItems = data?.meta?.total ?? mappedPatients.length;
  const pageSize = data?.meta?.pageSize ?? itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <DataTable<Patient>
      title="My Patients"
      description="Patient records from your current roster"
      data={mappedPatients}
      columns={patientColumns}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
      filters={{
        search: {
          value: search,
          placeholder: "Search patient by name",
          onChange: (v: string) => {
            setSearch(v);
            setCurrentPage(1);
          },
        },
        selects: [
          {
            id: "status",
            value: status,
            placeholder: "Status",
            options: [
              { label: "All Statuses", value: "" },
              { label: "Active", value: "active" },
              { label: "Discharged", value: "discharged" },
              { label: "Follow Up", value: "follow-up" },
            ],
            onChange: (value: string) => {
              setStatus(value);
              setCurrentPage(1);
            },
            widthClassName: "!min-w-[120px] max-w-fit",
          },
        ],
      }}
      totalItems={totalItems}
      isLoading={isLoading || isFetching}
    />
  );
};

export default MyPatientList;
