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
import { UploadCloud, UserRound } from "lucide-react";
import type { ReceptionistShift } from "@/features/receptionist/type";
import { useCreateReceptionistMutation } from "@/features/receptionist/receptionistApi";

type SelectOption = {
  label: string;
  value: string;
};

type ShiftOption = {
  label: string;
  value: ReceptionistShift;
};

export type AddReceptionistPayload = {
  name: string;
  username: string;
  password: string;
  imageFile?: File;
  department: string;
  contactNumber: string;
  shift: ReceptionistShift;
  description?: string;
};

type AddReceptionistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentOptions: SelectOption[];
};

const SHIFT_OPTIONS: ShiftOption[] = [
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
  { label: "Night", value: "Night" },
];

export default function AddReceptionistDialog({
  open,
  onOpenChange,
  departmentOptions,
}: AddReceptionistDialogProps) {
  const fileInputId = useId();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [shift, setShift] = useState<ShiftOption["value"]>("Morning");
  const [description, setDescription] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

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
    return (
      name.trim() &&
      username.trim() &&
      password.trim() &&
      department &&
      contactNumber.trim() &&
      shift
    );
  }, [contactNumber, department, name, password, shift, username]);

  const handleSetFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setImageFile(null);
    setImagePreview("");
    setDepartment("");
    setContactNumber("");
    setShift("Morning");
    setDescription("");
  };

  const [createReceptionist, { isLoading }] = useCreateReceptionistMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    const res = await createReceptionist({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      image: imageFile ?? undefined,
      department_id: department,
      contact_number: contactNumber.trim(),
      shift,
      description: description.trim() || undefined,
    }).unwrap();

    if (res?.success) {
      console.log("Success");
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Receptionist</DialogTitle>
          <DialogDescription>
            Enter the receptionist&apos;s basic information.
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
              <label className="text-sm font-medium">Shift</label>
              <Select
                value={shift}
                onValueChange={(v) => setShift(v as ShiftOption["value"])}
              >
                <SelectTrigger className="h-10" disabled={isLoading}>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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
              {imagePreview ? (
                <img
                  src={imagePreview}
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
              {isLoading ? "Creating..." : "Create Receptionist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
