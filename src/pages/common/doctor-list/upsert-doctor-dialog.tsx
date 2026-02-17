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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoveRight,
  Plus,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import { useUpdateDoctorMutation } from "@/features/doctors/doctorsApi";
import type { UpdateDoctorPayload } from "@/features/doctors/type";

type DepartmentOption = {
  label: string;
  value: string;
  specialties?: { label: string; value: string }[];
};

type TimeRange = {
  id: string;
  startTime: string;
  endTime: string;
};

type WeeklySchedule = Record<string, TimeRange[]>;

export type UpsertDoctorInitialData = {
  id: string;
  name: string;
  username?: string;
  profileImageUrl?: string;
  departmentId: string;
  specialty: string;
  contactNumber: string;
  description?: string;
  schedule: WeeklySchedule;
};

type UpsertDoctorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: DepartmentOption[];
  initialData?: UpsertDoctorInitialData | null;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const normalizeSchedule = (schedule: WeeklySchedule) =>
  Object.entries(schedule)
    .map(([day, ranges]) => ({
      day,
      ranges: ranges
        .map((range) => `${range.startTime}-${range.endTime}`)
        .sort(),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

const sameSchedule = (left: WeeklySchedule, right: WeeklySchedule) => {
  const normalizedLeft = normalizeSchedule(left);
  const normalizedRight = normalizeSchedule(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((entry, index) => {
    const target = normalizedRight[index];
    if (!target || entry.day !== target.day) {
      return false;
    }
    if (entry.ranges.length !== target.ranges.length) {
      return false;
    }

    return entry.ranges.every((range, rangeIndex) => range === target.ranges[rangeIndex]);
  });
};

const dayCodeMap: Record<string, string> = {
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
  Sun: "SUN",
};

export function mapScheduleToPayload(schedule: WeeklySchedule) {
  return Object.entries(schedule)
    .filter(([, ranges]) => ranges.length > 0)
    .map(([dayName, ranges]) => ({
      [dayCodeMap[dayName] ?? dayName]: ranges
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
}

export default function UpsertDoctorDialog({
  open,
  onOpenChange,
  departmentOptions,
  initialData,
}: UpsertDoctorDialogProps) {
  const fileInputId = useId();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(initialData?.name ?? "");
  const [username, setUsername] = useState(initialData?.username ?? "");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [department, setDepartment] = useState(initialData?.departmentId ?? "");
  const [specialty, setSpecialty] = useState(initialData?.specialty ?? "");
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialData?.schedule ?? {});
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentStep(1);
    setName(initialData?.name ?? "");
    setUsername(initialData?.username ?? "");
    setPassword("");
    setImageFile(null);
    setDepartment(initialData?.departmentId ?? "");
    setSpecialty(initialData?.specialty ?? "");
    setContactNumber(initialData?.contactNumber ?? "");
    setDescription(initialData?.description ?? "");
    setSchedule(initialData?.schedule ?? {});
  }, [initialData, open]);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : initialData?.profileImageUrl ?? ""),
    [imageFile, initialData?.profileImageUrl],
  );

  useEffect(() => {
    if (!imageFile || !imagePreview) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imageFile, imagePreview]);

  const filteredSpecialtyOptions = useMemo(() => {
    if (!department) return [];
    return (
      departmentOptions.find((option) => option.value === department)?.specialties ?? []
    );
  }, [department, departmentOptions]);

  const selectedDepartmentLabel = useMemo(() => {
    return (
      departmentOptions.find((option) => option.value === department)?.label ??
      "Select department"
    );
  }, [department, departmentOptions]);

  const selectedSpecialtyLabel = useMemo(() => {
    if (!department) return "Select department first";
    return (
      filteredSpecialtyOptions.find((option) => option.value === specialty)?.label ??
      "Select specialty"
    );
  }, [department, filteredSpecialtyOptions, specialty]);

  const isUpdateMode = Boolean(initialData?.id);

  const hasChanges = useMemo(() => {
    if (!isUpdateMode || !initialData) {
      return true;
    }

    return (
      name.trim() !== (initialData.name?.trim() ?? "") ||
      username.trim() !== (initialData.username?.trim() ?? "") ||
      department !== initialData.departmentId ||
      specialty !== initialData.specialty ||
      contactNumber.trim() !== (initialData.contactNumber?.trim() ?? "") ||
      description.trim() !== (initialData.description?.trim() ?? "") ||
      !sameSchedule(schedule, initialData.schedule ?? {}) ||
      Boolean(password.trim()) ||
      Boolean(imageFile)
    );
  }, [
    contactNumber,
    department,
    description,
    imageFile,
    initialData,
    isUpdateMode,
    name,
    password,
    schedule,
    specialty,
    username,
  ]);

  const isValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        name.trim() &&
        contactNumber.trim() &&
        department &&
        specialty &&
        (isUpdateMode ? hasChanges : username.trim() && password.trim())
      );
    }

    return Object.keys(schedule).some((day) => schedule[day] && schedule[day].length > 0);
  }, [
    contactNumber,
    currentStep,
    department,
    hasChanges,
    isUpdateMode,
    name,
    password,
    schedule,
    specialty,
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

  const handleSetFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || !initialData?.id) return;

    const payload: UpdateDoctorPayload = {};

    if (name.trim() !== (initialData.name?.trim() ?? "")) {
      payload.name = name.trim();
    }
    if (username.trim() !== (initialData.username?.trim() ?? "")) {
      payload.username = username.trim();
    }
    if (department !== initialData.departmentId) {
      payload.department_id = department;
    }
    if (specialty !== initialData.specialty) {
      payload.specialty = specialty;
    }
    if (contactNumber.trim() !== (initialData.contactNumber?.trim() ?? "")) {
      payload.contact_number = contactNumber.trim();
    }
    if (description.trim() !== (initialData.description?.trim() ?? "")) {
      payload.description = description.trim();
    }
    if (!sameSchedule(schedule, initialData.schedule ?? {})) {
      payload.schedules = mapScheduleToPayload(schedule);
    }
    if (password.trim()) {
      payload.password = password.trim();
    }
    if (imageFile) {
      payload.image = imageFile;
    }

    await updateDoctor({ doctorId: initialData.id, payload }).unwrap();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isUpdateMode ? "Update Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Edit doctor information."
              : "Update the doctor's weekly schedule."}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 flex items-center space-x-2">
          <div className="font-semibold text-blue-500">1. Basic Details</div>
          <MoveRight className={cn(currentStep >= 2 ? "text-gray-500" : "text-gray-200")} />
          <div
            className={cn(
              "flex rounded-full",
              currentStep >= 2 ? "font-semibold text-blue-500" : "opacity-40",
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
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact number</label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+880 1712-345678"
                    disabled={isUpdating}
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
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUpdating}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedDepartmentLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={department || "__none"}
                        onValueChange={(value) => {
                          if (value === "__none") {
                            setDepartment("");
                            setSpecialty("");
                            return;
                          }

                          setDepartment(value);
                          const nextSpecialties =
                            departmentOptions.find((option) => option.value === value)
                              ?.specialties ?? [];
                          if (
                            specialty &&
                            !nextSpecialties.some((option) => option.value === specialty)
                          ) {
                            setSpecialty("");
                          }
                        }}
                      >
                        <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                        {departmentOptions.map((option) => (
                          <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!department || isUpdating}
                        className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                      >
                        <span className="truncate">{selectedSpecialtyLabel}</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={specialty || "__none"}
                        onValueChange={(value) =>
                          setSpecialty(value === "__none" ? "" : value)
                        }
                      >
                        <DropdownMenuRadioItem value="__none">Unselect</DropdownMenuRadioItem>
                        {filteredSpecialtyOptions.length ? (
                          filteredSpecialtyOptions.map((option) => (
                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                              {option.label}
                            </DropdownMenuRadioItem>
                          ))
                        ) : (
                          <DropdownMenuItem disabled>No specialties found</DropdownMenuItem>
                        )}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short bio, qualifications, focus areas..."
                  className="min-h-[90px] w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSetFile(e.target.files?.[0])}
                  disabled={isUpdating}
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
                    <div className="mt-2 text-xs text-black/50">
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
                <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {weekDays.map((day) => {
                    const daySchedule = schedule[day] || [];

                    return (
                      <div key={day} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">{day}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeRange(day)}
                            disabled={isUpdating}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Time
                          </Button>
                        </div>

                        {daySchedule.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.map((range) => (
                              <div key={range.id} className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="time"
                                  value={range.startTime}
                                  onChange={(e) =>
                                    updateTimeRange(day, range.id, "startTime", e.target.value)
                                  }
                                  disabled={isUpdating}
                                  step={900}
                                  className="flex-1"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                  type="time"
                                  value={range.endTime}
                                  onChange={(e) =>
                                    updateTimeRange(day, range.id, "endTime", e.target.value)
                                  }
                                  disabled={isUpdating}
                                  step={900}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeRange(day, range.id)}
                                  disabled={isUpdating}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No schedule set</p>
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
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isValid || isUpdating}
                  className={!isValid ? "opacity-50" : ""}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isUpdating}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={!isValid || isUpdating}>
                  {isUpdating ? "Updating..." : "Update Doctor"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
