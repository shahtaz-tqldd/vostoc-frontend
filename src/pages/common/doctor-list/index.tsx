import { useEffect, useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  contact: string;
  status: "Active" | "On Leave" | "Unavailable";
  imageUrl: string;
};

// Create mock doctor data
const mockDoctors: Doctor[] = Array.from({ length: 55 }, (_, i) => {
  const specialties = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
  ];
  const departments = [
    "Heart Center",
    "Brain Institute",
    "Children's Hospital",
    "Bone & Joint",
    "Skin Clinic",
  ];
  const statusOptions = ["Active", "On Leave", "Unavailable"];

  const specialtyIndex = i % specialties.length;

  return {
    id: `DOC-${1000 + i}`,
    name: `Dr. ${["Smith Rowan", "Johnson Nails", "Williams Shatner", "Brown Dan", "Jones Doe", "Garcia Miller", "Miller Righrs", "Davis Erikson"][i % 8]}`,
    specialty: specialties[specialtyIndex],
    department: departments[specialtyIndex],
    contact: `${["+880 152 130 5382", "+880 152 130 3245", "+880 152 130 2146", "+880 152 130 5419"][i % 4]}`,
    status: statusOptions[i % 3] as Doctor["status"],
    imageUrl: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-xnGLZJFli6FRyXSlm8-QnpJb9hh30HffEA&s`,
  };
});

const departmentOptions = Array.from(
  new Set(mockDoctors.map((doctor) => doctor.department)),
).map((department) => ({ label: department, value: department }));

// Define the columns for the doctor table
const doctorColumns: ColumnDef<Doctor>[] = [
  {
    header: "Doctor",
    accessorKey: "name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={row.imageUrl} alt={row.name} />
          <AvatarFallback>
            {row.name.split(" ")[1]?.charAt(0) || row.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.id}</div>
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
      const status = row.status;
      const variant = {
        Active: "mint",
        "On Leave": "ink",
        Unavailable: "coral",
      }[status] as "mint" | "ink" | "coral";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export default function DoctorListPage() {
  // Manage pagination state in the parent component
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, status]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mockDoctors.filter((doctor) => {
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

      const matchesDepartment = department && doctor.department === department;

      const matchesStatus = status && doctor.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [department, search, status]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedData = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DataTable<Doctor>
      title="Doctor Directory"
      description="Browse our medical staff by specialty and department."
      data={paginatedData}
      columns={doctorColumns}
      filters={{
        search: {
          value: search,
          placeholder: "Search doctors...",
          onChange: setSearch,
        },
        selects: [
          {
            id: "department",
            value: department,
            placeholder: "Department",
            options: departmentOptions,
            onChange: setDepartment,
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
            onChange: setStatus,
            widthClassName: "min-w-[120px] max-w-fit",
          },
        ],
        onReset: () => {
          setSearch("");
          setDepartment("");
          setStatus("");
        },
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    />
  );
}
