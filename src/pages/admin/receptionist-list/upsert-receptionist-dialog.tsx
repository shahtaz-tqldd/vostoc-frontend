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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, UploadCloud, UserRound } from "lucide-react";
import type {
  ReceptionistShift,
  UpdateReceptionistPayload,
} from "@/features/receptionist/type";
import {
  useCreateReceptionistMutation,
  useUpdateReceptionistMutation,
} from "@/features/receptionist/receptionistApi";

type SelectOption = {
  label: string;
  value: string;
};

type ShiftOption = {
  label: string;
  value: ReceptionistShift;
};

export type UpsertReceptionistInitialData = {
  id: string;
  name: string;
  username?: string;
  profileImageUrl?: string;
  departments: string[];
  contactNumber: string;
  shift: ReceptionistShift;
  description?: string;
};

const normalizeDepartmentIds = (ids: string[]) => [...ids].sort();

const sameDepartmentIds = (left: string[], right: string[]) => {
  const normalizedLeft = normalizeDepartmentIds(left);
  const normalizedRight = normalizeDepartmentIds(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every(
    (value, index) => value === normalizedRight[index],
  );
};

type UpsertReceptionistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: SelectOption[];
  initialData?: UpsertReceptionistInitialData | null;
};

const SHIFT_OPTIONS: ShiftOption[] = [
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
  { label: "Night", value: "Night" },
];

export default function UpsertReceptionistDialog({
  open,
  onOpenChange,
  departmentOptions,
  initialData,
}: UpsertReceptionistDialogProps) {
  const fileInputId = useId();

  const [name, setName] = useState(initialData?.name ?? "");
  const [username, setUsername] = useState(initialData?.username ?? "");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [departmentIds, setDepartmentIds] = useState<string[]>(
    initialData?.departments ?? [],
  );
  const [contactNumber, setContactNumber] = useState(
    initialData?.contactNumber ?? "",
  );
  const [shift, setShift] = useState<ShiftOption["value"]>(
    initialData?.shift ?? "Morning",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [isDragActive, setIsDragActive] = useState(false);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(() => {
    if (!imagePreview) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const isUpdateMode = Boolean(initialData?.id);

  const hasChanges = useMemo(() => {
    if (!isUpdateMode || !initialData) {
      return true;
    }

    const initialName = initialData.name?.trim() ?? "";
    const initialUsername = initialData.username?.trim() ?? "";
    const initialContact = initialData.contactNumber?.trim() ?? "";
    const initialDescription = initialData.description?.trim() ?? "";

    return (
      name.trim() !== initialName ||
      username.trim() !== initialUsername ||
      contactNumber.trim() !== initialContact ||
      shift !== initialData.shift ||
      description.trim() !== initialDescription ||
      !sameDepartmentIds(departmentIds, initialData.departments ?? []) ||
      Boolean(password.trim()) ||
      Boolean(imageFile)
    );
  }, [
    contactNumber,
    departmentIds,
    description,
    imageFile,
    initialData,
    isUpdateMode,
    name,
    password,
    shift,
    username,
  ]);

  const isValid = useMemo(() => {
    return (
      name.trim() &&
      departmentIds.length > 0 &&
      contactNumber.trim() &&
      shift &&
      (isUpdateMode ? hasChanges : username.trim() && password.trim())
    );
  }, [
    contactNumber,
    departmentIds.length,
    hasChanges,
    isUpdateMode,
    name,
    password,
    shift,
    username,
  ]);

  const handleSetFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  const selectedDepartmentOptions = useMemo(
    () =>
      departmentOptions.filter((option) =>
        departmentIds.includes(option.value),
      ),
    [departmentIds, departmentOptions],
  );

  const isAllDepartmentsSelected =
    departmentOptions.length > 0 &&
    selectedDepartmentOptions.length === departmentOptions.length;

  const departmentTriggerLabel = useMemo(() => {
    if (isAllDepartmentsSelected) {
      return "All departments";
    }
    if (selectedDepartmentOptions.length === 1) {
      return selectedDepartmentOptions[0].label;
    }
    if (selectedDepartmentOptions.length > 1) {
      return `${selectedDepartmentOptions.length} departments selected`;
    }
    return "Select department";
  }, [isAllDepartmentsSelected, selectedDepartmentOptions]);

  const toggleDepartment = (departmentId: string) => {
    setDepartmentIds((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId],
    );
  };

  const [createReceptionist, { isLoading: isCreating }] =
    useCreateReceptionistMutation();
  const [updateReceptionist, { isLoading: isUpdating }] =
    useUpdateReceptionistMutation();
  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    if (isUpdateMode && initialData?.id) {
      const payload: UpdateReceptionistPayload = {};
      const currentName = name.trim();
      const currentUsername = username.trim();
      const currentContact = contactNumber.trim();
      const currentDescription = description.trim();
      const currentDepartments = normalizeDepartmentIds(departmentIds);
      const initialDepartments = normalizeDepartmentIds(
        initialData.departments ?? [],
      );

      if (currentName !== (initialData.name?.trim() ?? "")) {
        payload.name = currentName;
      }
      if (currentUsername !== (initialData.username?.trim() ?? "")) {
        payload.username = currentUsername;
      }
      if (currentContact !== (initialData.contactNumber?.trim() ?? "")) {
        payload.contact_number = currentContact;
      }
      if (shift !== initialData.shift) {
        payload.shift = shift;
      }
      if (!sameDepartmentIds(currentDepartments, initialDepartments)) {
        payload.department_ids = currentDepartments;
      }
      if (currentDescription !== (initialData.description?.trim() ?? "")) {
        payload.description = currentDescription;
      }
      if (password.trim()) {
        payload.password = password.trim();
      }
      if (imageFile) {
        payload.image = imageFile;
      }

      await updateReceptionist({
        receptionistId: initialData.id,
        payload,
      }).unwrap();
    } else {
      await createReceptionist({
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        image: imageFile ?? undefined,
        department_ids: departmentIds,
        contact_number: contactNumber.trim(),
        shift,
        description: description.trim() || undefined,
      }).unwrap();
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdateMode ? "Update Receptionist" : "Add Receptionist"}
          </DialogTitle>
          <DialogDescription>
            {isUpdateMode
              ? "Edit receptionist information and save changes."
              : "Enter the receptionist&apos;s basic information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Receptionist name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayesha Rahman"
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
                placeholder="reception.ayesha"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isUpdateMode ? "Leave blank to keep current" : "••••••••"
                }
                disabled={isLoading}
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
                    disabled={isLoading}
                    className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                  >
                    <span className="truncate">{departmentTriggerLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      if (isAllDepartmentsSelected) {
                        setDepartmentIds([]);
                        return;
                      }
                      setDepartmentIds(
                        departmentOptions.map((option) => option.value),
                      );
                    }}
                  >
                    {isAllDepartmentsSelected ? "Clear all" : "Select all"}
                  </DropdownMenuItem>
                  {departmentOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={departmentIds.includes(option.value)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => toggleDepartment(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shift</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal"
                  >
                    <span>{shift}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  <DropdownMenuRadioGroup
                    value={shift}
                    onValueChange={(value) =>
                      setShift(value as ShiftOption["value"])
                    }
                  >
                    {SHIFT_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              {selectedDepartmentOptions.length > 0 ? (
                <>
                  Assigned:{" "}
                  {selectedDepartmentOptions
                    .map((option) => option.label)
                    .join(", ")}
                </>
              ) : (
                "Assigned: none"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes: front desk, call handling, billing support..."
              className="min-h-[90px] w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
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
              {imagePreview || initialData?.profileImageUrl ? (
                <img
                  src={imagePreview || initialData?.profileImageUrl}
                  alt="Receptionist preview"
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

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className={!isValid || isLoading ? "opacity-50" : ""}
            >
              {isLoading
                ? isUpdateMode
                  ? "Updating..."
                  : "Creating..."
                : isUpdateMode
                  ? "Update Receptionist"
                  : "Create Receptionist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
