import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useCreateDepartmentMutation } from "@/features/doctors/doctorsApi";

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDepartmentDialog({
  open,
  onOpenChange,
}: AddDepartmentDialogProps) {
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();
  const [departmentName, setDepartmentName] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty(""); // Clear the input after adding
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setSpecialties(specialties.filter((s) => s !== specialtyToRemove));
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (departmentName.trim()) {
      setError(null);
      try {
        await createDepartment({
          name: departmentName.trim(),
          specialties,
        }).unwrap();

        // Reset form and close dialog
        setDepartmentName("");
        setSpecialties([]);
        onOpenChange(false);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "data" in err) {
          const apiError = err as { data?: { message?: string } };
          setError(apiError.data?.message || "Failed to create department");
        } else {
          setError("Failed to create department");
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[465px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription className="max-w-sm">
            Create a new department and specify its medical specialties.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Cardiology"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="specialty">Specialties</label>
              <div className="flex gap-2">
                <Input
                  id="specialty"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="e.g., Interventional Cardiology"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent form submission
                      handleAddSpecialty();
                    }
                  }}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  className="h-9 w-9 !p-1"
                  onClick={handleAddSpecialty}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="tim"
                      className="flex items-center gap-1 pr-1"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="rounded-full p-0.5 hover:bg-muted"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !departmentName.trim()}
            >
              {isLoading ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
