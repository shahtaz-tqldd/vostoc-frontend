export type PrescriptionMedicine = {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  notes: string;
};

export type PrescriptionDraft = {
  medicines: PrescriptionMedicine[];
  advices: string[];
  tests: string[];
  additionalInfo: string;
  followUpDate: string;
};

export type PrescriptionStage =
  | "idle"
  | "generating"
  | "ready"
  | "saved"
  | "printed";
