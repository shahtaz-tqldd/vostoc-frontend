import { useEffect, useId, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  UploadCloud,
  UserRound,
  MoveRight,
} from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
  specialties: {
    label: string;
    value: string;
  }[];
};

type TimeRange = {
  id: string;
  startTime: string;
  endTime: string;
};

type WeeklySchedule = {
  [key: string]: TimeRange[];
};

export type AddDoctorPayload = {
  name: string;
  username: string;
  password: string;
  imageFile?: File;
  department: string;
  specialty: string;
  contactNumber: string;
  description?: string;
  schedule: WeeklySchedule;
};

type AddDoctorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: SelectOption[];
  onSubmit: (payload: AddDoctorPayload) => void | Promise<void>;
  isLoading?: boolean;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddDoctorDialog({
  open,
  onOpenChange,
  departmentOptions,
  onSubmit,
  isLoading = false,
}: AddDoctorDialogProps) {
  const fileInputId = useId();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [isDragActive, setIsDragActive] = useState(false);

  // Filter specialty options based on selected department
  const filteredSpecialtyOptions = useMemo(() => {
    if (!department) return [];
    return departmentOptions.find((option) => option.value === department)
      ?.specialties;
  }, [department, departmentOptions]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const isValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        name.trim() &&
        username.trim() &&
        password.trim() &&
        department &&
        specialty &&
        contactNumber.trim()
      );
    } else {
      return Object.keys(schedule).some(
        (day) => schedule[day] && schedule[day].length > 0,
      );
    }
  }, [
    currentStep,
    contactNumber,
    department,
    name,
    schedule,
    specialty,
    password,
    username,
  ]);

  const addTimeRange = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        { id: Date.now().toString(), startTime: "", endTime: "" },
      ],
    }));
  };

  const updateTimeRange = (
    day: string,
    id: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((range) =>
        range.id === id ? { ...range, [field]: value } : range,
      ),
    }));
  };

  const removeTimeRange = (day: string, id: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((range) => range.id !== id),
    }));
  };

  // Fixed TypeScript error by adding proper type annotation
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    await onSubmit({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      imageFile: imageFile ?? undefined,
      department,
      specialty,
      contactNumber: contactNumber.trim(),
      description: description.trim() || undefined,
      schedule,
    });

    // Reset form
    setName("");
    setUsername("");
    setPassword("");
    setImageFile(null);
    setImagePreview("");
    setDepartment("");
    setSpecialty("");
    setContactNumber("");
    setDescription("");
    setSchedule({});
    setCurrentStep(1);
    onOpenChange(false);
  };

  const nextStep = () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSetFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Doctor</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Enter the doctor's basic information."
              : "Set the doctor's weekly schedule."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 my-2">
          <div className="text-blue-500 font-semibold">1. Basic Details</div>
          <MoveRight
            className={cn(currentStep >= 2 ? "text-gray-500" : "text-gray-200")}
          />

          <div
            className={cn(
              "flex rounded-full",
              currentStep >= 2 ? "text-blue-500 font-semibold" : "opacity-40",
            )}
          >
            2. Schedule Setup
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {currentStep === 1 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact number</label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+880 1712-345678"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User name</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="dr.jane"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-10" disabled={isLoading}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <Select
                    value={specialty}
                    onValueChange={setSpecialty}
                    disabled={!department || isLoading}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue
                        placeholder={
                          department
                            ? "Select specialty"
                            : "Select department first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSpecialtyOptions?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short bio, qualifications, focus areas..."
                  className="min-h-[90px] w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                {/* <label className="text-sm font-medium">Profile image</label> */}
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSetFile(e.target.files?.[0])}
                  disabled={isLoading}
                />
                <label
                  htmlFor={fileInputId}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    handleSetFile(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition",
                    isDragActive
                      ? "border-mint-400 bg-mint-400/10"
                      : "border-ink-200 bg-white/70 hover:border-ink-400",
                  )}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Doctor preview"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900/10">
                      <UserRound className="h-6 w-6 text-ink-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium text-ink-900">
                      <UploadCloud className="h-4 w-4" />
                      Upload Profile Image
                    </div>
                    <div className="text-xs text-black/50 mt-2">
                      {imageFile?.name ?? "PNG, JPG, WEBP up to 2MB"}
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Weekly Schedule</label>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {weekDays.map((day) => {
                    const daySchedule = schedule[day] || [];

                    return (
                      <div key={day} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{day}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeRange(day)}
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Time
                          </Button>
                        </div>

                        {daySchedule.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.map((range) => (
                              <div
                                key={range.id}
                                className="flex items-center gap-2"
                              >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="time"
                                  value={range.startTime}
                                  onChange={(e) =>
                                    updateTimeRange(
                                      day,
                                      range.id,
                                      "startTime",
                                      e.target.value,
                                    )
                                  }
                                  disabled={isLoading}
                                  step={900}
                                  className="flex-1"
                                />
                                <span className="text-muted-foreground">
                                  to
                                </span>
                                <Input
                                  type="time"
                                  value={range.endTime}
                                  onChange={(e) =>
                                    updateTimeRange(
                                      day,
                                      range.id,
                                      "endTime",
                                      e.target.value,
                                    )
                                  }
                                  disabled={isLoading}
                                  step={900}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeRange(day, range.id)}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No schedule set
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {currentStep === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isValid || isLoading}
                  className={!isValid ? "opacity-50" : ""}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button type="submit" disabled={!isValid || isLoading}>
                  {isLoading ? "Creating..." : "Create Doctor"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
