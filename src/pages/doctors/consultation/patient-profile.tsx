import {
  Heart,
  Pill,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ConsultationAppointment,
  ConsultationPastAppointment,
  LatestVitals,
} from "@/features/appointment/type";

type PatientProfileProps = {
  currentAppointment: ConsultationAppointment;
  pastAppointments: ConsultationPastAppointment[];
  onLatestVitalsChange?: (
    latestVitals: LatestVitals | Record<string, unknown>,
  ) => void;
  onMedicalHistoryChange?: (medicalHistory: {
    allergies: string[];
    chronicConditions: string[];
  }) => void;
};

type VitalKey =
  | "bloodGroup"
  | "bloodPressure"
  | "temperature"
  | "weight"
  | "heartRate"
  | "bmi";

type VitalConfig = {
  key: VitalKey;
  label: string;
  unit?: string;
  aliases: string[];
  placeholder: string;
};

type VitalsState = Record<VitalKey, string>;

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
      const val = source[foundKey];
      if (val !== undefined && val !== null) return String(val);
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

function toLatestVitalsPayload(
  existing: unknown,
  next: VitalsState,
): LatestVitals | Record<string, unknown> {
  const base = parseLatestVitals(existing);

  return {
    ...base,
    blood_group: next.bloodGroup || null,
    blood_pressure: next.bloodPressure || null,
    temperature: next.temperature || null,
    weight: next.weight || null,
    heart_rate: next.heartRate || null,
    bmi: next.bmi || null,
  };
}

function parseUnknownObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function findValueByAliases(
  source: Record<string, unknown>,
  aliases: string[],
) {
  for (const alias of aliases) {
    const direct = source[alias];
    if (direct !== undefined && direct !== null) return direct;

    const foundKey = Object.keys(source).find(
      (item) => item.toLowerCase() === alias.toLowerCase(),
    );
    if (foundKey) return source[foundKey];
  }
  return undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      }
    } catch {
      // Fallback to separator parsing.
    }

    return trimmed
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function toUniqueStrings(values: string[]) {
  const deduped = new Set<string>();

  values.forEach((item) => {
    const normalized = item.trim();
    if (!normalized) return;
    const hasSame = [...deduped].some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase(),
    );
    if (!hasSame) deduped.add(normalized);
  });

  return [...deduped];
}

function getMedicalHistoryArrays(appointment: ConsultationAppointment) {
  const appointmentData = parseUnknownObject(appointment);
  const info = parseUnknownObject(appointment.info);

  const allergiesRaw =
    findValueByAliases(appointmentData, ["allergies"]) ??
    findValueByAliases(info, ["allergies"]);
  const chronicConditionsRaw =
    findValueByAliases(appointmentData, [
      "chronicConditions",
      "chronic_conditions",
    ]) ?? findValueByAliases(info, ["chronicConditions", "chronic_conditions"]);
  const medicationsRaw =
    findValueByAliases(appointmentData, [
      "currentMedications",
      "current_medications",
    ]) ??
    findValueByAliases(info, ["currentMedications", "current_medications"]);

  return {
    allergies: toUniqueStrings(toStringArray(allergiesRaw)),
    chronicConditions: toUniqueStrings(toStringArray(chronicConditionsRaw)),
    currentMedications: toUniqueStrings(toStringArray(medicationsRaw)),
  };
}

const PatientProfile = ({
  currentAppointment,
  pastAppointments,
  onLatestVitalsChange,
  onMedicalHistoryChange,
}: PatientProfileProps) => {
  const [activeVital, setActiveVital] = useState<VitalKey | null>(null);
  const [vitals, setVitals] = useState<VitalsState>(() =>
    toVitalsState(currentAppointment.latest_vitals),
  );
  const [allergies, setAllergies] = useState<string[]>(
    () => getMedicalHistoryArrays(currentAppointment).allergies,
  );
  const [chronicConditions, setChronicConditions] = useState<string[]>(
    () => getMedicalHistoryArrays(currentAppointment).chronicConditions,
  );
  const [allergyInput, setAllergyInput] = useState("");
  const [chronicInput, setChronicInput] = useState("");
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [isAddingCondition, setIsAddingCondition] = useState(false);

  const currentMedications = useMemo(
    () => getMedicalHistoryArrays(currentAppointment).currentMedications,
    [
      currentAppointment.id,
      currentAppointment.currentMedications,
      currentAppointment.current_medications,
      currentAppointment.info,
    ],
  );

  useEffect(() => {
    setVitals(toVitalsState(currentAppointment.latest_vitals));
    setActiveVital(null);
    const medicalHistory = getMedicalHistoryArrays(currentAppointment);
    setAllergies(medicalHistory.allergies);
    setChronicConditions(medicalHistory.chronicConditions);
    setAllergyInput("");
    setChronicInput("");
    setIsAddingAllergy(false);
    setIsAddingCondition(false);
  }, [
    currentAppointment.id,
    currentAppointment.info,
    currentAppointment.allergies,
    currentAppointment.chronicConditions,
    currentAppointment.chronic_conditions,
    currentAppointment.latest_vitals,
  ]);

  useEffect(() => {
    if (!onLatestVitalsChange) return;
    onLatestVitalsChange(
      toLatestVitalsPayload(currentAppointment.latest_vitals, vitals),
    );
  }, [currentAppointment.latest_vitals, onLatestVitalsChange, vitals]);

  const mergedAllergies = useMemo(
    () => toUniqueStrings([...allergies, allergyInput]),
    [allergies, allergyInput],
  );

  const mergedChronicConditions = useMemo(
    () => toUniqueStrings([...chronicConditions, chronicInput]),
    [chronicConditions, chronicInput],
  );

  useEffect(() => {
    if (!onMedicalHistoryChange) return;
    onMedicalHistoryChange({
      allergies: mergedAllergies,
      chronicConditions: mergedChronicConditions,
    });
  }, [mergedAllergies, mergedChronicConditions, onMedicalHistoryChange]);

  const normalizedPastAppointments = useMemo(
    () =>
      pastAppointments.map((entry, index) => ({
        id: entry.appointment?.id ?? `${entry.date ?? "past"}-${index}`,
        date: entry.date ?? entry.appointment?.appointmentDate,
        appointment: entry.appointment,
      })),
    [pastAppointments],
  );

  const isFollowUp = normalizedPastAppointments.length > 0;

  const handleVitalEdit = (key: VitalKey) => {
    setActiveVital(key);
  };

  const handleVitalChange = (key: VitalKey, value: string) => {
    setVitals((prev) => ({ ...prev, [key]: value }));
  };

  const addListValue = (
    rawValue: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    const next = rawValue.trim();
    if (!next) return;

    setter((prev) => {
      if (prev.some((item) => item.toLowerCase() === next.toLowerCase())) {
        return prev;
      }
      return [...prev, next];
    });
  };

  const commitAllergyInput = () => {
    addListValue(allergyInput, setAllergies);
    setAllergyInput("");
  };

  const commitConditionInput = () => {
    addListValue(chronicInput, setChronicConditions);
    setChronicInput("");
  };

  const handleAddAllergy = () => {
    if (!isAddingAllergy) {
      setIsAddingAllergy(true);
      return;
    }
    commitAllergyInput();
  };

  const handleAddCondition = () => {
    if (!isAddingCondition) {
      setIsAddingCondition(true);
      return;
    }
    commitConditionInput();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-white font-semibold">
              {currentAppointment.patientName ?? "Unknown patient"}
            </h3>
            <p className="text-slate-300 text-xs mt-0.5">
              Age: {currentAppointment.patientAge ?? "-"} •{" "}
              {currentAppointment.patientGender ?? "-"}
            </p>
          </div>
          {isFollowUp && (
            <span className="text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded-full font-semibold">
              Follow-up
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-400 font-semibold">Patient Notes</p>
          <p className="text-xs text-gray-700 mt-0.5 font-bold">
            {currentAppointment.patientNotes || "No notes provided"}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs text-gray-500 font-semibold">Latest Vitals</p>
            <span className="text-[10px] text-gray-400">Click to update</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {VITAL_CONFIG.map((vital) => {
              const isEditing = activeVital === vital.key;
              const value = vitals[vital.key];
              const displayValue = value
                ? vital.unit
                  ? `${value} ${vital.unit}`
                  : value
                : "-";

              if (isEditing) {
                return (
                  <div
                    key={vital.key}
                    className="bg-white border border-indigo-300 rounded-lg p-2"
                  >
                    <p className="text-[10px] text-gray-500 font-semibold">
                      {vital.label}
                    </p>
                    <input
                      value={value}
                      onChange={(event) =>
                        handleVitalChange(vital.key, event.target.value)
                      }
                      placeholder={vital.placeholder}
                      className="w-full text-xs font-semibold text-slate-700 border-none focus:outline-none focus:border-none"
                      autoFocus
                      onBlur={() => setActiveVital(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  key={vital.key}
                  onClick={() => handleVitalEdit(vital.key)}
                  className="text-left bg-white border border-slate-200 hover:border-indigo-300 rounded-lg p-2 transition-colors"
                >
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {vital.label}
                  </p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {displayValue}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-red-50 border border-red-400 rounded-lg p-2">
          <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
            <TriangleAlert size={10} /> Allergies
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {allergies.length === 0 && !isAddingAllergy && (
              <span className="text-[11px] text-rose-300">
                No allergies recorded
              </span>
            )}
            {allergies.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-white text-red-500 border border-red-200 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    setAllergies((prev) =>
                      prev.filter((entry) => entry !== item),
                    )
                  }
                  className="text-red-400 hover:text-red-600"
                  aria-label={`Remove ${item}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {isAddingAllergy && (
              <span className="inline-flex items-center bg-white border border-red-300 rounded-full px-2 py-0.5">
                <input
                  value={allergyInput}
                  onChange={(event) => setAllergyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      commitAllergyInput();
                    }
                    if (event.key === "Escape") {
                      setAllergyInput("");
                      setIsAddingAllergy(false);
                    }
                  }}
                  autoFocus
                  placeholder="Type allergy"
                  className="min-w-20 bg-transparent text-[11px] text-slate-700 focus:outline-none"
                />
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddAllergy}
            className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
          >
            {isAddingAllergy ? "+ Add Another" : "+ Add Allergy"}
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-xs text-blue-400 font-semibold flex items-center gap-1">
            <Heart size={10} /> Chronic Conditions
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {chronicConditions.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              >
                {item}
                <button
                  type="button"
                  onClick={() =>
                    setChronicConditions((prev) =>
                      prev.filter((entry) => entry !== item),
                    )
                  }
                  className="text-blue-400 hover:text-blue-600"
                  aria-label={`Remove ${item}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {chronicConditions.length === 0 && !isAddingCondition && (
              <span className="text-[11px] text-gray-400">
                No chronic conditions recorded
              </span>
            )}
            {isAddingCondition && (
              <span className="inline-flex items-center bg-white border border-blue-300 rounded-full px-2 py-0.5">
                <input
                  value={chronicInput}
                  onChange={(event) => setChronicInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      commitConditionInput();
                    }
                    if (event.key === "Escape") {
                      setChronicInput("");
                      setIsAddingCondition(false);
                    }
                  }}
                  autoFocus
                  placeholder="Type condition"
                  className="bg-transparent text-[11px] text-slate-700 focus:outline-none"
                />
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddCondition}
            className="mt-2 text-xs font-semibold text-blue-500 hover:text-blue-600"
          >
            {isAddingCondition ? "+ Add Another" : "+ Add Condition"}
          </button>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Pill size={10} /> Current Medications
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {currentMedications.length > 0 ? (
              currentMedications.map((item) => (
                <span
                  key={item}
                  className="text-[11px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-semibold"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">
                No current medications found
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
