import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { PAST_VISITS, PATIENTS } from "./mock_data";
import type { TodaysAppointment } from "../overview/mock_data";

type PatientProfileProps = {
  appointment: TodaysAppointment;
};

const PatientProfile = ({ appointment }: PatientProfileProps) => {
  const p = PATIENTS[appointment.patientId];
  const visits = PAST_VISITS[p.id] || [];
  const [showPast, setShowPast] = useState(p.isFollowUp);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div
          className="px-5 py-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg,#1e293b,#334155)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white/30"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {p.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{p.name}</h3>
              {p.isFollowUp && (
                <span className="text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded-full font-semibold">
                  Follow-up
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              {p.age}y • {p.gender} • Blood: {p.bloodType}
            </p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold">Phone</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5">
                {p.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Emergency</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5 truncate">
                {p.emergencyContact.name}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold">Occupation</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5">
                {p.occupation}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Insurance</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5">
                {p.insurance}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">Address</p>
            <p className="text-xs text-gray-700 font-bold mt-0.5">
              {p.address}
            </p>
          </div>
          {p.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle
                size={14}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-red-700">Allergies</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {p.allergies.join(", ")}
                </p>
              </div>
            </div>
          )}
          {p.careFlags?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold">Care Flags</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {p.careFlags.map((flag) => (
                  <span
                    key={flag}
                    className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {p.chronicConditions.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <Heart size={10} /> Chronic Conditions
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {p.chronicConditions.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-semibold mb-2">
              Latest Vitals
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["BP", p.vitals.bp],
                ["Pulse", `${p.vitals.pulse} bpm`],
                ["Temp", p.vitals.temp],
                ["SpO2", p.vitals.spo2],
                ["Weight", `${p.vitals.weightKg} kg`],
                ["BMI", p.vitals.bmi],
              ].map(([label, value]) => (
                <div key={label} className="text-xs">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    {label}
                  </p>
                  <p className="text-xs font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-semibold">Lifestyle</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5">
                {p.lifestyle.activity} activity
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Smoking: {p.lifestyle.smoking}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Last Visit</p>
              <p className="text-xs text-gray-700 font-bold mt-0.5">
                {p.lastVisit}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Alcohol: {p.lifestyle.alcohol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">Current Meds</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {p.currentMeds.map((med) => (
                <span
                  key={med}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200"
                >
                  {med}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">
              Recent Labs & Tests
            </p>
            <div className="mt-1 space-y-1">
              {p.recentLabs.map((lab) => (
                <div
                  key={lab}
                  className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
                >
                  {lab}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 font-semibold">
              Today's Chief Complaint
            </p>
            <p className="text-xs text-gray-700 mt-0.5 font-bold">
              {appointment.chief}
            </p>
          </div>
        </div>
      </div>

      {/* Past visits */}
      {p.isFollowUp && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowPast(!showPast)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" />
              <span className="text-sm font-bold text-gray-700">
                Past Appointment History
              </span>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                {visits.length}
              </span>
            </div>
            {showPast ? (
              <ChevronUp size={14} className="text-gray-400" />
            ) : (
              <ChevronDown size={14} className="text-gray-400" />
            )}
          </button>
          {showPast && (
            <div className="px-3 pb-3 space-y-2">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {v.date}
                      </span>
                    </div>
                    <ChevronDown
                      size={12}
                      className={`text-gray-400 transition-transform ${expanded === v.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expanded === v.id && (
                    <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Complaint
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {v.chiefComplaint}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Diagnosis
                        </p>
                        <p className="text-xs text-gray-700 font-bold mt-0.5">
                          {v.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Prescription
                        </p>
                        <div className="mt-1 space-y-1">
                          {v.prescription.map((m, i) => (
                            <div
                              key={i}
                              className="bg-slate-50 rounded-lg px-2.5 py-1.5"
                            >
                              <p className="text-xs font-bold text-slate-700">
                                {m.medicine}{" "}
                                <span className="font-normal text-slate-500">
                                  — {m.dose}
                                </span>
                              </p>
                              <p className="text-xs text-slate-400">
                                {m.frequency} • {m.duration}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {v.notes && (
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">
                            Notes
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 italic">
                            {v.notes}
                          </p>
                        </div>
                      )}
                      {v.testReports.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">
                            Test Reports
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {v.testReports.map((r) => (
                              <span
                                key={r}
                                className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full"
                              >
                                📄 {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
