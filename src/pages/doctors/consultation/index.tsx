import { ArrowLeft, Check, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import RecordingPanel from "./recording-panel";
import PatientProfile from "./patient-profile";
import { Link, useParams } from "react-router-dom";
import { DoctorTopbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import {
  useGetConsultationDataQuery,
  useCompleteConsultationMutation,
} from "@/features/appointment/appointmentApiSlice";
import type {
  ConsultationAppointment,
  LatestVitals,
} from "@/features/appointment/type";
import PastAppointments from "./past-appointments";
import ReportPanel from "./report-panel";
import PrescriptionDrawer from "./prescription-drawer";
import type { PrescriptionDraft, PrescriptionStage } from "./type";

function parseUnknownObject(value: unknown): Record<string, unknown> {
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

function findValueByAliases(
  source: Record<string, unknown>,
  aliases: string[],
): unknown {
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

function toComparableArray(values: string[]) {
  return toUniqueStrings(values)
    .map((item) => item.toLowerCase())
    .sort();
}

function areStringArraysEqual(a: string[], b: string[]) {
  const left = toComparableArray(a);
  const right = toComparableArray(b);
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function getExistingMedicalHistory(appointment: ConsultationAppointment) {
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

  return {
    allergies: toUniqueStrings(toStringArray(allergiesRaw)),
    chronicConditions: toUniqueStrings(toStringArray(chronicConditionsRaw)),
  };
}

function getInfoString(
  appointment: ConsultationAppointment,
  aliases: string[],
): string {
  const appointmentData = parseUnknownObject(appointment);
  const info = parseUnknownObject(appointment.info);
  const value =
    findValueByAliases(appointmentData, aliases) ??
    findValueByAliases(info, aliases);
  return value === undefined || value === null ? "" : String(value);
}

function getChangedVitals(
  existing: unknown,
  draft: LatestVitals | Record<string, unknown> | null,
) {
  if (!draft) return null;

  const previous = parseUnknownObject(existing);
  const next = parseUnknownObject(draft);
  const changed: Record<string, unknown> = {};

  Object.keys(next).forEach((key) => {
    const prevValue = previous[key] ?? null;
    const nextValue = next[key] ?? null;
    if (prevValue !== nextValue) {
      changed[key] = nextValue;
    }
  });

  return Object.keys(changed).length > 0 ? changed : null;
}

const ConsultationPage = () => {
  const { patientId: appointmentId } = useParams();
  const { data } = useGetConsultationDataQuery(appointmentId ?? skipToken);

  const currentAppointment = data?.current_appointment ?? null;
  const pastAppointments = data?.past_appointments ?? [];
  const [started] = useState(false);
  const [startTime] = useState<Date | null>(null);
  const [pStage, setPStage] = useState<PrescriptionStage>("idle");
  const [prescription, setPrescription] = useState<PrescriptionDraft | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [selfNote, setSelfNote] = useState("");
  const [uploadedReportsDraft, setUploadedReportsDraft] = useState<File[]>([]);

  const [latestVitalsDraft, setLatestVitalsDraft] = useState<
    LatestVitals | Record<string, unknown> | null
  >(null);
  const [medicalHistoryDraft, setMedicalHistoryDraft] = useState<{
    allergies: string[];
    chronicConditions: string[];
  } | null>(null);
  const [completeError, setCompleteError] = useState("");
  const [completeConsultation, { isLoading: isCompleting }] =
    useCompleteConsultationMutation();

  const handleGenerate = () => {
    setPStage("generating");
    setTimeout(() => {
      setDiagnosis(
        "Stable Angina - mild exacerbation with orthostatic component",
      );
      setPrescription({
        medicines: [
          {
            medicine: "Atenolol",
            dose: "50mg",
            frequency: "Once daily (morning)",
            duration: "30 days",
            notes: "Replaces previous beta-blocker; monitor for fatigue",
          },
          {
            medicine: "Atorvastatin",
            dose: "40mg",
            frequency: "Once daily (evening)",
            duration: "30 days",
            notes: "Continue as before",
          },
          {
            medicine: "Nitroglycerin (sublingual)",
            dose: "0.4mg",
            frequency: "As needed for chest pain",
            duration: "30 days",
            notes: "Under tongue, max 3 doses in 15 min",
          },
        ],
        advices: [
          "Avoid heavy physical exertion for 2 weeks",
          "Limit salt and processed foods",
          "Daily 20 min brisk walk if no chest pain",
        ],
        tests: ["ECG (resting)", "Lipid panel", "HbA1c"],
        additionalInfo:
          "Discussed red-flag symptoms and emergency plan. Review medication adherence and BP log in next visit.",
        followUpDate: "2026-02-28",
      });
      setPStage("ready");
    }, 1800);
  };

  useEffect(() => {
    if (pStage === "ready") {
      setDrawerOpen(true);
    }
  }, [pStage]);

  useEffect(() => {
    if (!currentAppointment) return;

    setDiagnosis(getInfoString(currentAppointment, ["diagnosis"]));
    setSelfNote(
      getInfoString(currentAppointment, [
        "self_notes",
        "selfNote",
        "self_note",
      ]),
    );
  }, [currentAppointment]);

  const handleCompleteAppointment = async () => {
    if (!currentAppointment?.id) return;

    setCompleteError("");

    try {
      const formData = new FormData();
      let hasChanges = false;

      const changedVitals = getChangedVitals(
        currentAppointment.latest_vitals,
        latestVitalsDraft,
      );
      if (currentAppointment.patientId) {
        formData.append("patient_id", JSON.stringify(currentAppointment.patientId));
      }
      if (changedVitals) {
        formData.append("vitals", JSON.stringify(changedVitals));
        hasChanges = true;
      }

      if (medicalHistoryDraft) {
        const existingHistory = getExistingMedicalHistory(currentAppointment);
        const nextAllergies = toUniqueStrings(medicalHistoryDraft.allergies);
        const nextChronicConditions = toUniqueStrings(
          medicalHistoryDraft.chronicConditions,
        );

        if (!areStringArraysEqual(existingHistory.allergies, nextAllergies)) {
          formData.append("allergies", JSON.stringify(nextAllergies));
          hasChanges = true;
        }
        if (
          !areStringArraysEqual(
            existingHistory.chronicConditions,
            nextChronicConditions,
          )
        ) {
          formData.append(
            "chronic_conditions",
            JSON.stringify(nextChronicConditions),
          );
          hasChanges = true;
        }
      }

      uploadedReportsDraft.forEach((file) => {
        formData.append("reports", file);
      });
      if (uploadedReportsDraft.length > 0) {
        hasChanges = true;
      }

      const existingDiagnosis = getInfoString(currentAppointment, [
        "diagnosis",
      ]);
      if (diagnosis.trim() !== existingDiagnosis.trim()) {
        formData.append("diagnosis", diagnosis.trim());
        hasChanges = true;
      }

      const existingSelfNote = getInfoString(currentAppointment, [
        "self_notes",
        "selfNote",
        "self_note",
      ]);
      if (selfNote.trim() !== existingSelfNote.trim()) {
        formData.append("self_notes", selfNote.trim());
        hasChanges = true;
      }

      if (prescription) {
        const prescriptionPayload = {
          advices: prescription.advices
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
          medicines: prescription.medicines
            .map((medicine) => ({
              medicine: medicine.medicine.trim(),
              dose: medicine.dose.trim(),
              frequency: medicine.frequency.trim(),
              duration: medicine.duration.trim(),
              notes: medicine.notes.trim(),
            }))
            .filter((medicine) => medicine.medicine.length > 0),
          tests: prescription.tests
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
          additional_info: prescription.additionalInfo.trim(),
          follow_up_date: prescription.followUpDate || null,
        };
        formData.append("prescription", JSON.stringify(prescriptionPayload));
        hasChanges = true;
      }

      if (!hasChanges) {
        return;
      }

      await completeConsultation({
        appointmentId: currentAppointment.id,
        payload: formData,
      }).unwrap();
    } catch {
      setCompleteError("Failed to save consultation updates. Please retry.");
    }
  };

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

  if (!currentAppointment) {
    return (
      <div className="flex-1 p-6">
        <DoctorTopbar />
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500">
          No active appointment found for this patient.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="px-4 md:px-8 py-4">
        <DoctorTopbar />
      </div>

      <div className="p-4 md:p-8 !pt-4 flex flex-col h-full gap-6">
        {/* Body */}
        <div className="grid gap-5 grid grid-cols-2">
          <div className="space-y-3">
            <PatientProfile
              currentAppointment={currentAppointment}
              pastAppointments={pastAppointments}
              onLatestVitalsChange={setLatestVitalsDraft}
              onMedicalHistoryChange={setMedicalHistoryDraft}
            />
            <ReportPanel
              isFollowUp={isFollowUp}
              onUploadsChange={setUploadedReportsDraft}
            />
            <PastAppointments
              pastAppointments={pastAppointments}
              normalizedPastAppointments={normalizedPastAppointments}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex justify-between items-center gap-3">
              <Link to="/">
                <Button size="sm" variant="ghost">
                  <ArrowLeft size={12} />
                  Go Back
                </Button>
              </Link>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${pStage === "saved" || pStage === "printed" ? "bg-emerald-100 text-emerald-700" : started ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {pStage === "saved" || pStage === "printed"
                    ? "Completed"
                    : started
                      ? "In Progress"
                      : "Not Started"}
                </span>
                {started && startTime && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>

            <RecordingPanel
              prescriptionStage={pStage}
              onGenerate={handleGenerate}
              onOpenPrescription={() => setDrawerOpen(true)}
            />

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700">Diagnosis</h3>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full mt-1 min-h-[84px] text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
                  placeholder="Primary diagnosis and clinical impression..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-700">
                    Self Notes
                  </h3>
                  <p className="text-xs text-gray-400">
                    Private notes for the doctor only.
                  </p>
                </div>
                <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  Not shared
                </span>
              </div>
              <textarea
                value={selfNote}
                onChange={(e) => setSelfNote(e.target.value)}
                className="w-full min-h-[120px] text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
                placeholder="Add your observations, differential thoughts, or follow-up reminders..."
              />
            </div>

            {completeError && (
              <p className="text-xs text-red-500">{completeError}</p>
            )}
            <Button
              className="w-full"
              onClick={handleCompleteAppointment}
              disabled={isCompleting}
            >
              <Check size={14} />
              {isCompleting
                ? "Saving consultation..."
                : "Complete & Proceed to Next Patient"}
            </Button>
          </div>
        </div>
      </div>

      <PrescriptionDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        pStage={pStage}
        setPStage={setPStage}
        prescription={prescription}
        setPrescription={setPrescription}
      />
    </div>
  );
};

export default ConsultationPage;
