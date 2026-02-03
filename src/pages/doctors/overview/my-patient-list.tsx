import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { Badge } from "@/components/ui/badge";

type Patient = {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
  status: "Active" | "Discharged" | "Follow-up";
};

// --- Mock patient data ---
const mockPatients: Patient[] = Array.from({ length: 55 }, (_, i) => ({
  id: `PT-${2000 + i}`,
  name: `Patient ${i + 1}`,
  age: 20 + (i % 40),
  lastVisit: `${10 + (i % 15)} Jan 2026`,
  condition: ["Diabetes", "Hypertension", "Flu", "Asthma"][i % 4],
  status: ["Active", "Discharged", "Follow-up"][i % 3] as Patient["status"],
}));

// --- Table columns ---
const patientColumns: ColumnDef<Patient>[] = [
  {
    header: "Patient ID",
    accessorKey: "id",
  },
  {
    header: "Patient Name",
    accessorKey: "name",
  },
  {
    header: "Age",
    accessorKey: "age",
  },
  {
    header: "Last Visit",
    accessorKey: "lastVisit",
  },
  {
    header: "Condition",
    accessorKey: "condition",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => {
      const status = row.status;
      const variant = {
        Active: "mint",
        Discharged: "ink",
        "Follow-up": "coral",
      }[status] as "mint" | "ink" | "coral";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const MyPatientList = () => {
  const [search, setSearch] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedData = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DataTable<Patient>
      title="My Patients"
      description="Patients currently under your care and recent follow-ups."
      data={paginatedData}
      columns={patientColumns}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
      filters={{
        search: {
          value: search,
          placeholder: "Search patient by name",
          onChange: setSearch,
        },
      }}
    />
  );
};

export default MyPatientList;
