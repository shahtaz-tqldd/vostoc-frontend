import { formatDate } from "@/lib/time";
import { Calendar, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";

const PastAppointments = ({
  pastAppointments,
  normalizedPastAppointments,
}: {
  pastAppointments: any[];
  normalizedPastAppointments: any[];
}) => {
  const [showPast, setShowPast] = useState(pastAppointments.length > 0);
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setShowPast((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-500" />
          <span className="text-sm font-bold text-gray-700">
            Past Appointment History
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
            {normalizedPastAppointments.length}
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
          {normalizedPastAppointments.length === 0 ? (
            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
              No past appointments available.
            </div>
          ) : (
            normalizedPastAppointments.map((item) => {
              const isOpen = expanded === item.id;
              return (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <ChevronDown
                      size={12}
                      className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Doctor
                        </p>
                        <p className="text-xs text-gray-700 font-bold mt-0.5">
                          {item.appointment?.doctor?.name ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Department
                        </p>
                        <p className="text-xs text-gray-700 font-bold mt-0.5">
                          {item.appointment?.department?.name ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Appointment Status
                        </p>
                        <p className="text-xs text-gray-700 font-bold mt-0.5">
                          {item.appointment?.appointmentStatus ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">
                          Notes
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 italic">
                          {item.appointment?.patientNotes ||
                            "No notes provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PastAppointments;
