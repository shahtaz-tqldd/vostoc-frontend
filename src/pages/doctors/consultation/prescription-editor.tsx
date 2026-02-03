import {
  CheckCircle2,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { PATIENTS } from "./mock_data";

const PrescriptionEditor = ({
  prescription,
  setPrescription,
  stage,
  onSave,
  onPrint,
  appointment,
}) => {
  const p = PATIENTS[appointment.patientId];
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  if (!prescription) return null;

  const updateMed = (i, f, v) => {
    const m = [...prescription.medicines];
    m[i] = { ...m[i], [f]: v };
    setPrescription({ ...prescription, medicines: m });
  };
  const removeMed = (i) =>
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, j) => j !== i),
    });
  const addMed = () =>
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        { medicine: "", dose: "", frequency: "", duration: "", notes: "" },
      ],
    });

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setTimeout(() => {
      setUploads((prev) => [...prev, ...files.map((f) => f.name)]);
      setUploading(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
      >
        <div>
          <h3 className="text-white font-bold text-sm">
            ✦ AI-Generated Prescription
          </h3>
          <p className="text-indigo-200 text-xs mt-0.5">
            Review & edit before saving
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${stage === "saved" || stage === "printed" ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40" : "bg-white/20 text-white border border-white/30"}`}
        >
          {stage === "saved" || stage === "printed" ? "✓ Saved" : "Draft"}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Diagnosis */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Diagnosis
          </label>
          <textarea
            value={prescription.diagnosis}
            onChange={(e) =>
              setPrescription({ ...prescription, diagnosis: e.target.value })
            }
            className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
            rows={2}
          />
        </div>

        {/* Medicines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Medicines
            </label>
            <button
              onClick={addMed}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="space-y-2">
            {prescription.medicines.map((med, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/50 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">
                    #{i + 1}
                  </span>
                  <button
                    onClick={() => removeMed(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["medicine", "Medicine"],
                    ["dose", "Dose"],
                    ["frequency", "Frequency"],
                    ["duration", "Duration"],
                  ].map(([f, l]) => (
                    <div key={f}>
                      <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                      <input
                        value={med[f]}
                        onChange={(e) => updateMed(i, f, e.target.value)}
                        className="w-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  ))}
                </div>
                {med.notes && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-200">
                    💡 {med.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Instructions
          </label>
          <textarea
            value={prescription.instructions}
            onChange={(e) =>
              setPrescription({ ...prescription, instructions: e.target.value })
            }
            className="w-full mt-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
            rows={2}
          />
        </div>

        {/* Follow-up date */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Follow-up Date
          </label>
          <input
            type="date"
            value={prescription.followUpDate}
            onChange={(e) =>
              setPrescription({ ...prescription, followUpDate: e.target.value })
            }
            className="w-full mt-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Upload test reports for follow-ups */}
        {p.isFollowUp && (
          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Upload size={11} /> Upload Test Reports
            </label>
            <label className="cursor-pointer block mt-1.5">
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
                accept=".pdf,.jpg,.png"
              />
              <div className="border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-xl p-3 text-center transition-colors">
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-indigo-500 font-bold">
                      Uploading…
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={16} className="mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">
                      Drop PDF / Image or{" "}
                      <span className="text-indigo-500 font-bold">browse</span>
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
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {stage === "ready" && (
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <Save size={14} /> Save Prescription
            </button>
          )}
          {(stage === "saved" || stage === "printed") && (
            <button
              onClick={onPrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm transition-all"
            >
              <Printer size={14} /> Print Prescription
            </button>
          )}
        </div>
        {(stage === "saved" || stage === "printed") && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 font-bold">
              {stage === "printed"
                ? "Prescription printed & saved."
                : "Prescription saved successfully."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionEditor;
