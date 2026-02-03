import { ArrowLeft, Clock, Play } from "lucide-react";
import { useState } from "react";
import RecordingPanel from "./recording-panel";
import PrescriptionEditor from "./prescription-editor";
import PatientProfile from "./patient-profile";
import { PATIENTS } from "./mock_data";
import { Link, useParams } from "react-router-dom";
import { TODAYS_APPOINTMENTS } from "../overview/mock_data";
import { DoctorTopbar } from "@/components/layout/Topbar";

const ConsultationPage = () => {
  const { patientId } = useParams();
  const appointment = TODAYS_APPOINTMENTS.find(
    (apt) => apt.patientId === patientId,
  );

  const p = PATIENTS[appointment.patientId];
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [pStage, setPStage] = useState("idle");
  const [prescription, setPrescription] = useState(null);

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
        instructions:
          "Avoid heavy physical exertion. Take medications as prescribed. Return if chest pain worsens or occurs at rest.",
        followUpDate: "2026-02-28",
      });
      setPStage("ready");
    }, 1800);
  };

  return (
    <div className="flex-1">
      <div className="px-4 md:px-8 py-4">
        <DoctorTopbar />
      </div>

      <div className="p-4 md:p-8 flex flex-col h-full gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Queue
          </Link>
          <div className="flex items-center gap-2.5">
            {started && startTime && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                {startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${pStage === "saved" || pStage === "printed" ? "bg-emerald-100 text-emerald-700" : started ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
            >
              {pStage === "saved" || pStage === "printed"
                ? "Completed"
                : started
                  ? "In Progress"
                  : "Not Started"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="">
          {!started ? (
            <div className="space-y-4">
              <PatientProfile appointment={appointment} />
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all"
              >
                <Play size={15} fill="currentColor" /> Start Consultation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick ref bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.age}y • {p.gender} • {appointment.chief}
                  </p>
                </div>
                {p.allergies.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    ⚠ {p.allergies.join(", ")}
                  </span>
                )}
              </div>

              <RecordingPanel
                onTranscriptReady={setTranscript}
                prescriptionStage={pStage}
                onGenerate={handleGenerate}
              />

              {prescription && (
                <PrescriptionEditor
                  prescription={prescription}
                  setPrescription={setPrescription}
                  stage={pStage}
                  onSave={() => setPStage("saved")}
                  onPrint={() => setPStage("printed")}
                  appointment={appointment}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
