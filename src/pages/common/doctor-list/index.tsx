import { useEffect, useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/components/table";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetDoctorsQuery } from "@/features/doctors/doctorsApi";
import { useGetDepartmentsQuery } from "@/features/department/departmentApi";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  contact: string;
  status: "Active" | "On Leave" | "Unavailable";
  imageUrl: string;
};

// Define the columns for the doctor table
const doctorColumns: ColumnDef<Doctor>[] = [
  {
    header: "Doctor",
    accessorKey: "name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={row.imageUrl} alt={row.name} />
          <AvatarFallback>
            {row.name.split(" ")[1]?.charAt(0) || row.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-base">{row.name}</div>
          <div className="text-sm text-muted-foreground uppercase">
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
];

export default function DoctorListPage() {
  // Manage pagination state in the parent component
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const { data: doctorsData } = useGetDoctorsQuery();
  const { data: departmentsData } = useGetDepartmentsQuery();

  const doctors = useMemo<Doctor[]>(() => {
    if (!doctorsData) {
      return [];
    }

    return doctorsData?.data?.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty?.name ?? "—",
      department: doctor.department?.name ?? "—",
      contact: doctor.contactNumber ?? "—",
      status: "Active",
      imageUrl: doctor.profileImageUrl ?? "",
    }));
  }, [doctorsData]);

  const departmentOptions = useMemo(
    () =>
      (departmentsData ?? []).map((dept) => ({
        label: dept.name,
        value: dept.name,
      })),
    [departmentsData],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, status]);

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
        ? doctor.department === department
        : true;

      const matchesStatus = status ? doctor.status === status : true;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [department, doctors, search, status]);

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
      totalItems={doctorsData?.meta.total}
    />
  );
}
