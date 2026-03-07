import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import {
  useGetAppointmentsQuery,
  useUpdateAppointmentMutation,
} from "@/features/appointment/appointmentApiSlice";
import { formatDateForApi } from "@/lib/time";
import { DataTable, type ColumnDef } from "@/components/table";
import { useAppSelector } from "@/app/hooks";
import { selectDepartmentFilterOptions } from "@/features/department/departmentSlice";
import ThreeDotMenu from "@/components/layout/ThreeDotMenu";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LatestVitals } from "@/features/appointment/type";

// types
type VitalKey =
  | "bloodGroup"
  | "bloodPressure"
  | "temperature"
  | "weight"
  | "heartRate"
  | "bmi";

type VitalsState = Record<VitalKey, string>;

type VitalConfig = {
  key: VitalKey;
  label: string;
  unit?: string;
  aliases: string[];
  placeholder: string;
};

type AppointmentRow = {
  id: string;
  patient: string;
  patientAge: number | null;
  patientGender: string | null;
  doctor:
    | {
        id: string;
        name: string;
        image_url?: string;
        department?: { name?: string };
        specialty?: { name?: string };
      }
    | undefined;
  time: string;
  contact: string | null;
  status: string;
  latestVitals?: LatestVitals | Record<string, unknown> | string | null;
};

const VITAL_CONFIG: VitalConfig[] = [
  {
    key: "bloodGroup",
    label: "Blood Group",
    aliases: ["blood_group", "bloodGroup"],
    placeholder: "O+",
  },
  {
    key: "bloodPressure",
    label: "BP",
    unit: "mmHg",
    aliases: ["blood_pressure", "bloodPressure", "bp"],
    placeholder: "120/80",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "F",
    aliases: ["temperature", "temp"],
    placeholder: "98.6",
  },
  {
    key: "weight",
    label: "Weight",
    unit: "kg",
    aliases: ["weight", "weight_kg", "weightKg"],
    placeholder: "70",
  },
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    aliases: ["heart_rate", "heartRate", "pulse", "pulse_rate"],
    placeholder: "72",
  },
  {
    key: "bmi",
    label: "BMI",
    aliases: ["bmi"],
    placeholder: "24.5",
  },
];

function parseLatestVitals(value: unknown): Record<string, unknown> {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return {};
}

function pickVitalValue(source: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    const direct = source[alias];
    if (direct !== undefined && direct !== null) return String(direct);

    const foundKey = Object.keys(source).find(
      (item) => item.toLowerCase() === alias.toLowerCase(),
    );
    if (foundKey) {
      const value = source[foundKey];
      if (value !== undefined && value !== null) return String(value);
    }
  }

  return "";
}

function toVitalsState(rawVitals: unknown): VitalsState {
  const parsed = parseLatestVitals(rawVitals);
  return VITAL_CONFIG.reduce(
    (acc, item) => ({
      ...acc,
      [item.key]: pickVitalValue(parsed, item.aliases),
    }),
    {
      bloodGroup: "",
      bloodPressure: "",
      temperature: "",
      weight: "",
      heartRate: "",
      bmi: "",
    } satisfies VitalsState,
  );
}

function toVitalsPayload(next: VitalsState): Record<string, unknown> {
  return {
    blood_group: next.bloodGroup || null,
    blood_pressure: next.bloodPressure || null,
    temperature: next.temperature || null,
    weight: next.weight || null,
    heart_rate: next.heartRate || null,
    bmi: next.bmi || null,
  };
}

export default function TodaysAppointmentQueue() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [editingVitalsAppointment, setEditingVitalsAppointment] =
    useState<AppointmentRow | null>(null);
  const [vitals, setVitals] = useState<VitalsState>({
    bloodGroup: "",
    bloodPressure: "",
    temperature: "",
    weight: "",
    heartRate: "",
    bmi: "",
  });
  const [saveError, setSaveError] = useState("");
  const departmentOptions = useAppSelector(selectDepartmentFilterOptions);
  const [updateAppointment, { isLoading: isSavingVitals }] =
    useUpdateAppointmentMutation();

  const {
    data,
    isLoading: isAppointmentLoading,
    isError,
  } = useGetAppointmentsQuery({
    pageSize: itemsPerPage,
    startDate: formatDateForApi(new Date()),
    endDate: formatDateForApi(new Date()),
    departmentId: department || undefined,
    search: search || undefined,
  });

  const rows = useMemo<AppointmentRow[]>(
    () =>
      (data?.data || []).map((item) => ({
        id: item.id,
        patient: item.patientName || "Unknown patient",
        patientAge: item.patientAge ?? null,
        patientGender: item.patientGender ?? null,
        contact: item.patientPhone ?? null,
        doctor: item.doctor,
        time: item.appointmentTime || "N/A",
        status: item?.appointmentStatus || "unknown",
        latestVitals: item.latest_vitals ?? null,
      })),
    [data],
  );

  const handleOpenVitalsDialog = (row: AppointmentRow) => {
    setEditingVitalsAppointment(row);
    setVitals(toVitalsState(row.latestVitals));
    setSaveError("");
  };

  const handleCloseVitalsDialog = (open: boolean) => {
    if (!open) {
      setEditingVitalsAppointment(null);
      setSaveError("");
    }
  };

  const handleVitalChange = (key: VitalKey, value: string) => {
    setVitals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveVitals = async () => {
    if (!editingVitalsAppointment) return;

    setSaveError("");
    try {
      await updateAppointment({
        appointmentId: editingVitalsAppointment.id,
        payload: {
          info: {
            vitals: toVitalsPayload(vitals),
          },
        },
      }).unwrap();
      setEditingVitalsAppointment(null);
    } catch {
      setSaveError("Failed to update vitals. Please retry.");
    }
  };

  const appointmentColumns: ColumnDef<AppointmentRow>[] = [
    {
      header: "Patient",
      accessorKey: "patient",
      cell: (row) => {
        return (
          <div>
            <h2>{row.patient}</h2>
            <p className="text-xs opacity-60">
              Age: {row.patientAge || "N/A"} • {row.patientGender || "N/A"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Contact",
      accessorKey: "contact",
    },
    {
      header: "Assigned Doctor",
      accessorKey: "doctor",
      cell: (row) => {
        return (
          <div>
            <h2>{row.doctor?.name || "Unassigned"}</h2>
            <p className="text-xs opacity-60">
              {row.doctor?.department?.name || "No Department"} •{" "}
              {row.doctor?.specialty?.name || "No Specialization"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Time Slot",
      accessorKey: "time",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const statusToVariant = {
          new: "success",
          "follow-up": "pending",
        } as const;
        const variant =
          statusToVariant[row.status as keyof typeof statusToVariant] ??
          "disabled";

        return <StatusBadge status={variant} label={row.status} />;
      },
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: (row) => (
        <ThreeDotMenu
          items={[
            {
              label: "Update Vitals",
              icon: Heart,
              disabled: isSavingVitals,
              onClick: () => handleOpenVitalsDialog(row),
            },
          ]}
        />
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  if (isAppointmentLoading) return <div>Loading appointments...</div>;
  if (isError) return <div>Failed to load appointments.</div>;

  return (
    <>
      <DataTable<AppointmentRow>
        title="Today's Appointment"
        description="32 Booking in 4 Doctors"
        data={rows}
        columns={appointmentColumns}
        filters={{
          search: {
            value: search,
            placeholder: "Search appointments...",
            onChange: handleSearchChange,
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
          ],
          onReset: () => {
            setSearch("");
            setCurrentPage(1);
            setDepartment("");
          },
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={rows.length}
      />

      <Dialog
        open={Boolean(editingVitalsAppointment)}
        onOpenChange={handleCloseVitalsDialog}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Update Vitals</DialogTitle>
            <DialogDescription>
              {editingVitalsAppointment?.patient
                ? `Update latest vitals for ${editingVitalsAppointment.patient}.`
                : "Update latest vitals for this appointment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VITAL_CONFIG.map((vital) => (
              <div key={vital.key} className="space-y-1.5">
                <Label htmlFor={`vital-${vital.key}`}>
                  {vital.label}
                  {vital.unit ? ` (${vital.unit})` : ""}
                </Label>
                <Input
                  id={`vital-${vital.key}`}
                  value={vitals[vital.key]}
                  onChange={(event) =>
                    handleVitalChange(vital.key, event.target.value)
                  }
                  placeholder={vital.placeholder}
                />
              </div>
            ))}
          </div>

          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingVitalsAppointment(null)}
              disabled={isSavingVitals}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveVitals}
              disabled={isSavingVitals}
            >
              {isSavingVitals ? "Saving..." : "Save Vitals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
