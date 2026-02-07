import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus, Users, Edit, Trash } from "lucide-react";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "@/features/department/departmentApi";
import DeleteDialog from "@/components/layout/DeleteDialog";
import { useState } from "react";
import NoDataFound from "@/components/layout/NoDataFound";

const DepartmentListPage = () => {
  const { data } = useGetDepartmentsQuery();
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  const handleDelete = async () => {
    if (!deleteOpen) return;
    await deleteDepartment(deleteOpen).unwrap();
    setDeleteOpen(null);
  };

  const totalDepartment = data?.length || 0;
  return (
    <>
      {!totalDepartment && (
        <div className="py-10">
          <NoDataFound title="departments" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((department, index) => (
          <DepartmentCard
            key={index}
            department={department}
            setDeleteOpen={setDeleteOpen}
          />
        ))}
      </div>
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteOpen(null);
        }}
        itemName="this department"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default DepartmentListPage;

const DepartmentCard = ({ department, setDeleteOpen }) => {
  const handleAddSpecialty = (departmentId: string) => {
    console.log(`Adding specialty to department ${departmentId}`);
    // Implementation would go here
  };

  const handleAssignDoctors = (departmentId: string) => {
    console.log(`Assigning doctors to department ${departmentId}`);
    // Implementation would go here
  };

  const handleUpdateDepartment = (departmentId: string) => {
    console.log(`Updating department ${departmentId}`);
    // Implementation would go here
  };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{department.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 !p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleAddSpecialty(department.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Specialty
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAssignDoctors(department.id)}
              >
                <Users className="mr-2 h-4 w-4" />
                Assign Doctors
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleUpdateDepartment(department.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Update Department
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(department.id)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Remove Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col justify-between flex-1">
        <div>
          <h4 className="text-sm font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {department.specialties?.slice(0, 4)?.map((specialty, index) => (
              <Badge key={index} variant="tim" className="text-xs">
                {specialty.name}
              </Badge>
            ))}
            {department.specialties.length > 4 && (
              <Badge className="text-xs">
                +{department.specialties.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Doctors</h4>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {department.doctors?.slice(0, 3).map((doctor) => (
                <Avatar
                  key={doctor.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage src={doctor.image_url} alt={doctor.name} />
                  <AvatarFallback className="text-xs">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {department.doctors?.length > 3 && (
              <div className="ml-2 text-sm text-muted-foreground">
                +{department.doctors?.length - 3} others
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
