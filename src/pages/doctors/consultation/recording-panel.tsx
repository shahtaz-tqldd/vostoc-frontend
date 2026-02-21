import { Clock, Mic, Sparkles, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PrescriptionStage } from "./index";

type RecordingPanelProps = {
  prescriptionStage: PrescriptionStage;
  onGenerate: () => void;
  onOpenPrescription: () => void;
};

const RecordingPanel = ({
  prescriptionStage,
  onGenerate,
  onOpenPrescription,
}: RecordingPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef<number | undefined>(undefined);
  const prevRef = useRef("");

  const start = () => {
    setIsRecording(true);
    setElapsed(0);
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };
  const stop = () => {
    setIsRecording(false);
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
    }
    const t =
      "Patient reports persistent chest tightness especially during morning walks. Denies shortness of breath at rest. Last medication taken this morning. Blood pressure reading today shows 148 over 92. Previous ECG was normal. Patient asks about switching to a different beta blocker due to fatigue side effect.";
    setTranscript(t);
  };
  useEffect(() => {
    if (transcript && transcript !== prevRef.current) {
      prevRef.current = transcript;
    }
  }, [transcript]);

  useEffect(
    () => () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
      }
    },
    [],
  );

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <style>{`@keyframes wb{from{height:15%}to{height:75%}}`}</style>
      <div className="flex items-center justify-between p-6">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Mic
            size={13}
            className={isRecording ? "text-red-500" : "text-gray-400"}
          />{" "}
          Consultation Recording
        </h3>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="px-6 pb-6 space-y-4">
        {/* Waveform */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col items-center gap-2">
          <div className="w-full h-10 flex items-center justify-center gap-px">
            {Array.from({ length: 56 }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full ${isRecording ? "bg-red-400" : "bg-gray-200"}`}
                style={{
                  height: isRecording
                    ? `${20 + Math.sin(i * 0.6) * 30 + Math.random() * 10}%`
                    : "25%",
                  animation: isRecording
                    ? `wb ${0.5 + (i % 5) * 0.12}s ease-in-out infinite alternate`
                    : "none",
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={11} />
            <span
              className={`text-sm font-mono font-bold ${isRecording ? "text-red-500" : "text-gray-400"}`}
            >
              {fmt(elapsed)}
            </span>
          </div>
        </div>

        {!transcript && (
          <button
            onClick={isRecording ? stop : start}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
          >
            {isRecording ? (
              <>
                <Square size={13} fill="currentColor" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic size={13} />
                <span>Start Recording</span>
              </>
            )}
          </button>
        )}

        {transcript && prescriptionStage === "idle" && (
          <div className="space-y-3">
            <button
              onClick={onGenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all"
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              }}
            >
              <Sparkles size={14} /> Generate Prescription
            </button>
          </div>
        )}

        {prescriptionStage === "generating" && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-indigo-600 font-bold">
              Generating prescription…
            </span>
          </div>
        )}

        {(prescriptionStage === "ready" ||
          prescriptionStage === "saved" ||
          prescriptionStage === "printed") && (
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-bold text-emerald-700">
                Prescription ready for review.
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Open the drawer to edit medicines, advice, tests, and notes.
              </p>
            </div>
            <button
              onClick={onOpenPrescription}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
            >
              <Sparkles size={14} /> Open Prescription Drawer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingPanel;
