import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  Play,
  Upload,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import RecordingPanel from "./recording-panel";
import PrescriptionEditor from "./prescription-editor";
import PatientProfile from "./patient-profile";
import { PATIENTS } from "./mock_data";
import { Link, useParams } from "react-router-dom";
import { TODAYS_APPOINTMENTS } from "../overview/mock_data";
import { DoctorTopbar } from "@/components/layout/Topbar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { TodaysAppointment } from "../overview/mock_data";

export type PrescriptionStage =
  | "idle"
  | "generating"
  | "ready"
  | "saved"
  | "printed";

export type PrescriptionMedicine = {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
};

export type PrescriptionDraft = {
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advices: string[];
  tests: string[];
  additionalInfo: string;
  followUpDate: string;
};

const ConsultationPage = () => {
  const { patientId } = useParams();
  const appointment = TODAYS_APPOINTMENTS.find(
    (apt) => apt.patientId === patientId,
  );

  const p = appointment ? PATIENTS[appointment.patientId] : null;
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pStage, setPStage] = useState<PrescriptionStage>("idle");
  const [prescription, setPrescription] = useState<PrescriptionDraft | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selfNote, setSelfNote] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setStartTime(new Date());
  };

  const handleGenerate = () => {
    setPStage("generating");
    setTimeout(() => {
      setPrescription({
        diagnosis:
          "Stable Angina — mild exacerbation with orthostatic component",
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

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setTimeout(() => {
      setUploads((prev) => [...prev, ...files.map((f: File) => f.name)]);
      setUploading(false);
    }, 800);
  };

  if (!appointment || !p) {
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

      <div className="p-4 md:p-8 flex flex-col h-full gap-4">
        {/* Body */}
        <div className="grid gap-4 grid grid-cols-2">
          <PatientProfile appointment={appointment as TodaysAppointment} />

          <div className="space-y-4">
            {!started ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Mic size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Ready to consult
                    </p>
                    <p className="text-xs text-slate-400">
                      Start the session to enable recording and prescription
                      generation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all"
                >
                  <Play size={15} fill="currentColor" /> Start Consultation
                </button>
              </div>
            ) : (
              <>
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

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700">
                        Upload Follow-up Reports
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Upload lab or imaging reports brought by the patient.
                      </p>
                    </div>
                    {uploads.length > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        {uploads.length} files
                      </span>
                    )}
                  </div>
                  <label className="cursor-pointer block mt-3">
                    <input
                      type="file"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                      accept=".pdf,.jpg,.png"
                      disabled={!p.isFollowUp}
                    />
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${p.isFollowUp ? "border-gray-200 hover:border-indigo-300" : "border-gray-100 bg-gray-50 text-gray-300"}`}
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-indigo-500 font-bold">
                            Uploading…
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload
                            size={18}
                            className="mx-auto text-gray-300 mb-1"
                          />
                          <p className="text-xs text-gray-400">
                            {p.isFollowUp
                              ? "Drop PDF / Image or browse"
                              : "Available for follow-up visits only"}
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                  {uploads.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {uploads.map((r, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full"
                        >
                          <FileText size={10} />
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.isFollowUp && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Attach reports to the patient's record for future visits.
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
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
                <Button className="w-full">
                  <Check size={14} />
                  Complete & Proceed to Next Patient
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>AI-Generated Prescription</DrawerTitle>
            <DrawerDescription>
              Review, edit, and finalize the prescription before saving.
            </DrawerDescription>
          </DrawerHeader>
          <div className="mt-4 border border-slate-200 rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Draft Status
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${pStage === "saved" || pStage === "printed" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}
              >
                {pStage === "saved" || pStage === "printed" ? "Saved" : "Draft"}
              </span>
            </div>
            <PrescriptionEditor
              prescription={prescription}
              setPrescription={setPrescription}
              stage={pStage}
              onSave={() => setPStage("saved")}
              onPrint={() => setPStage("printed")}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ConsultationPage;
