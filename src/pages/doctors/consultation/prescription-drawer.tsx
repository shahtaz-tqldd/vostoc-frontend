import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { CheckCircle2, Plus, Printer, Save, Trash2 } from "lucide-react";
import type {
  PrescriptionDraft,
  PrescriptionMedicine,
  PrescriptionStage,
} from "./type";

interface PrescriptionDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pStage: PrescriptionStage;
  setPStage: (stage: PrescriptionStage) => void;
  prescription: PrescriptionDraft | null;
  setPrescription: (prescription: PrescriptionDraft) => void;
}

const PrescriptionDrawer = ({
  open,
  setOpen,
  pStage,
  setPStage,
  prescription,
  setPrescription,
}: PrescriptionDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="h-screen overflow-y-auto">
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
  );
};

export default PrescriptionDrawer;

type PrescriptionEditorProps = {
  prescription: PrescriptionDraft | null;
  setPrescription: (value: PrescriptionDraft) => void;
  stage: PrescriptionStage;
  onSave: () => void;
  onPrint: () => void;
};

type ListKey = "advices" | "tests";

const PrescriptionEditor = ({
  prescription,
  setPrescription,
  stage,
  onSave,
  onPrint,
}: PrescriptionEditorProps) => {
  if (!prescription) return null;

  const updateMed = (i: number, f: keyof PrescriptionMedicine, v: string) => {
    const m = [...prescription.medicines];
    m[i] = { ...m[i], [f]: v };
    setPrescription({ ...prescription, medicines: m });
  };
  const removeMed = (i: number) =>
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, j: number) => j !== i),
    });
  const addMed = () =>
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        {
          medicine: "",
          dose: "",
          frequency: "",
          duration: "",
          notes: "",
        },
      ],
    });

  const updateListItem = (key: ListKey, index: number, value: string) => {
    const list = [...prescription[key]];
    list[index] = value;
    setPrescription({ ...prescription, [key]: list });
  };

  const removeListItem = (key: ListKey, index: number) =>
    setPrescription({
      ...prescription,
      [key]: prescription[key].filter((_, i: number) => i !== index),
    });

  const addListItem = (key: ListKey, value = "") =>
    setPrescription({
      ...prescription,
      [key]: [...prescription[key], value],
    });

  return (
    <div className="space-y-5">
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
                  ["notes", "Notes"],
                ].map(([f, l]) => (
                  <div key={f}>
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <input
                      value={med[f as keyof PrescriptionMedicine]}
                      onChange={(e) =>
                        updateMed(i, f as keyof PrescriptionMedicine, e.target.value)
                      }
                      className="w-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advice */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Advice
          </label>
          <button
            onClick={() => addListItem("advices", "")}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {prescription.advices.map((advice, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <input
                value={advice}
                onChange={(e) => updateListItem("advices", i, e.target.value)}
                className="flex-1 text-xs font-semibold text-gray-700 bg-transparent focus:outline-none"
                placeholder="Add lifestyle or safety advice"
              />
              <button
                onClick={() => removeListItem("advices", i)}
                className="text-gray-300 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tests */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Tests & Investigations
          </label>
          <button
            onClick={() => addListItem("tests", "")}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {prescription.tests.map((test, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <input
                value={test}
                onChange={(e) => updateListItem("tests", i, e.target.value)}
                className="flex-1 text-xs font-semibold text-gray-700 bg-transparent focus:outline-none"
                placeholder="Add lab, imaging, or follow-up test"
              />
              <button
                onClick={() => removeListItem("tests", i)}
                className="text-gray-300 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Additional Information
        </label>
        <textarea
          value={prescription.additionalInfo}
          onChange={(e) =>
            setPrescription({ ...prescription, additionalInfo: e.target.value })
          }
          className="w-full mt-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
          rows={3}
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
  );
};
