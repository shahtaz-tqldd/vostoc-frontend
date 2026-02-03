import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AddDepartmentDialog } from "../department-list/add-department-dialog";
import AddDoctorDialog, { type AddDoctorPayload } from "./add-doctor-dialog";
import {
  useCreateDoctorMutation,
  useGetDepartmentsQuery,
} from "@/features/doctors/doctorsApi";

const DoctorsLayout = () => {
  const location = useLocation();

  const isDoctorsActive =
    location.pathname === "/doctors/list" || location.pathname === "/doctors";
  const isDepartmentsActive = location.pathname === "/doctors/departments";

  const [addDepartment, setAddDepartment] = useState(false);
  const [addDoctor, setAddDoctor] = useState(false);
  const [createDoctor, { isLoading: isCreatingDoctor }] =
    useCreateDoctorMutation();

  const { data: departments = [] } = useGetDepartmentsQuery();

  const departmentOptions = useMemo(
    () =>
      departments.map((department) => ({
        label: department.name,
        value: department.id,
        specialties: department.specialties?.map((item) => ({
          label: item.name,
          value: item.name,
        })),
      })),
    [departments],
  );

  const handleCreateDoctor = async (payload: AddDoctorPayload) => {
    const schedules = Object.entries(payload.schedule)
      .filter(([, ranges]) => ranges.length > 0)
      .map(([dayName, ranges]) => ({
        [dayName]: ranges
          .filter((range) => range.startTime && range.endTime)
          .map((range) => ({
            start_time: range.startTime,
            end_time: range.endTime,
          })),
      }))
      .filter((entry) => {
        const dayName = Object.keys(entry)[0];
        return entry[dayName].length > 0;
      });

    await createDoctor({
      name: payload.name,
      username: payload.username,
      password: payload.password,
      department_id: payload.department,
      specialty: payload.specialty,
      contact_number: payload.contactNumber,
      description: payload.description,
      schedules,
      image: payload.imageFile,
    }).unwrap();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex bg-white p-2 rounded-full">
          <Link to="/doctors/list">
            <Button
              size="sm"
              variant={isDoctorsActive ? "primary" : "ghost"}
              className="rounded-full"
            >
              Doctors
            </Button>
          </Link>
          <Link to="/doctors/departments">
            <Button
              size="sm"
              variant={isDepartmentsActive ? "primary" : "ghost"}
              className="rounded-full"
            >
              Departments
            </Button>
          </Link>
        </div>
        {isDoctorsActive ? (
          <Button variant="secondary" onClick={() => setAddDoctor(true)}>
            <Plus size={14} />
            Add Doctor
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setAddDepartment(true)}>
            <Plus size={14} />
            Create Department
          </Button>
        )}
      </div>
      <Outlet />
      <AddDepartmentDialog
        open={addDepartment}
        onOpenChange={setAddDepartment}
      />
      <AddDoctorDialog
        open={addDoctor}
        onOpenChange={setAddDoctor}
        departmentOptions={departmentOptions}
        onSubmit={handleCreateDoctor}
        isLoading={isCreatingDoctor}
      />
    </div>
  );
};

export default DoctorsLayout;
