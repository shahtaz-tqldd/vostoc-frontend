import { useState, useRef, useEffect } from "react";
import { Mic, Square, Sparkles, Clock, Play, ArrowLeft, Bell, Calendar, ChevronRight, CheckCircle2, Circle, Loader2, AlertTriangle, ChevronDown, ChevronUp, FileText, Trash2, Plus, Printer, Save, Upload, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   1. MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const CURRENT_DOCTOR = { id: "doc_1", name: "Dr. Arjun Mehta", specialty: "General Medicine", avatar: "AM" };

const PATIENTS = {
  pat_1: { id:"pat_1", name:"Rahul Chakraborty", avatar:"RC", age:42, gender:"Male", phone:"+880 1712-345678", bloodType:"O+", allergies:["Penicillin","Sulfa drugs"], chronicConditions:["Hypertension","Type 2 Diabetes"], emergencyContact:{name:"Sunita Chakraborty",phone:"+880 1698-112233"}, isFollowUp:true },
  pat_2: { id:"pat_2", name:"Fatima Begum", avatar:"FB", age:35, gender:"Female", phone:"+880 1855-667890", bloodType:"A+", allergies:[], chronicConditions:[], emergencyContact:{name:"Karim Uddin",phone:"+880 1734-445566"}, isFollowUp:false },
  pat_3: { id:"pat_3", name:"Mohammad Hasan", avatar:"MH", age:58, gender:"Male", phone:"+880 1623-112244", bloodType:"B+", allergies:["Aspirin"], chronicConditions:["Coronary Artery Disease","Hyperlipidemia"], emergencyContact:{name:"Nasrin Hasan",phone:"+880 1799-887766"}, isFollowUp:true },
  pat_4: { id:"pat_4", name:"Priya Das", avatar:"PD", age:28, gender:"Female", phone:"+880 1556-998877", bloodType:"AB+", allergies:["Latex"], chronicConditions:["Asthma"], emergencyContact:{name:"Ravi Das",phone:"+880 1644-332211"}, isFollowUp:false },
  pat_5: { id:"pat_5", name:"Abdul Karim", avatar:"AK", age:67, gender:"Male", phone:"+880 1788-554433", bloodType:"O-", allergies:["Codeine","NSAIDs"], chronicConditions:["COPD","Hypertension","Arthritis"], emergencyContact:{name:"Salma Begum",phone:"+880 1833-221144"}, isFollowUp:true },
  pat_6: { id:"pat_6", name:"Nadia Rahman", avatar:"NR", age:31, gender:"Female", phone:"+880 1945-778899", bloodType:"A-", allergies:[], chronicConditions:["Migraine"], emergencyContact:{name:"Tariq Rahman",phone:"+880 1567-442233"}, isFollowUp:true },
};

const PAST_VISITS = {
  pat_1: [
    { id:"v101", date:"2026-01-15", chiefComplaint:"Routine blood sugar & BP monitoring", diagnosis:"Hypertension & T2DM — controlled", prescription:[{medicine:"Metformin",dose:"500mg",frequency:"Twice daily",duration:"30 days"},{medicine:"Amlodipine",dose:"5mg",frequency:"Once daily",duration:"30 days"}], notes:"HbA1c down to 7.2%. Continue current regimen.", testReports:["HbA1c_Jan2026.pdf","Lipid_Panel_Jan2026.pdf"] },
    { id:"v102", date:"2025-12-10", chiefComplaint:"Elevated blood sugar levels", diagnosis:"T2DM — poorly controlled", prescription:[{medicine:"Metformin",dose:"500mg",frequency:"Twice daily",duration:"30 days"},{medicine:"Glipizide",dose:"5mg",frequency:"Once daily",duration:"15 days"}], notes:"Adjusted diet counselling given.", testReports:["HbA1c_Dec2025.pdf"] },
  ],
  pat_3: [
    { id:"v201", date:"2026-01-08", chiefComplaint:"Chest tightness on exertion", diagnosis:"Stable Angina — mild exacerbation", prescription:[{medicine:"Atorvastatin",dose:"40mg",frequency:"Once daily",duration:"60 days"},{medicine:"Aspirin",dose:"81mg",frequency:"Once daily",duration:"60 days"},{medicine:"Nitroglycerin (sublingual)",dose:"0.4mg",frequency:"As needed",duration:"60 days"}], notes:"Stress test recommended. Avoid heavy exertion.", testReports:["ECG_Jan2026.pdf","Cardiac_Enzymes_Jan2026.pdf"] },
  ],
  pat_5: [
    { id:"v301", date:"2026-01-20", chiefComplaint:"Increased breathlessness", diagnosis:"COPD — moderate exacerbation", prescription:[{medicine:"Salbutamol Inhaler",dose:"2 puffs",frequency:"Three times daily",duration:"14 days"},{medicine:"Fluticasone Inhaler",dose:"2 puffs",frequency:"Twice daily",duration:"30 days"},{medicine:"Prednisolone",dose:"30mg",frequency:"Once daily",duration:"5 days"}], notes:"Pulmonary function test pending.", testReports:["Chest_XRay_Jan2026.pdf"] },
    { id:"v302", date:"2025-12-05", chiefComplaint:"Routine COPD follow-up", diagnosis:"COPD — stable", prescription:[{medicine:"Salbutamol Inhaler",dose:"2 puffs",frequency:"Twice daily",duration:"30 days"}], notes:"Stable. Continue maintenance.", testReports:[] },
  ],
  pat_6: [
    { id:"v401", date:"2026-01-22", chiefComplaint:"Recurring migraines — 3x/week", diagnosis:"Episodic migraine with aura", prescription:[{medicine:"Sumatriptan",dose:"50mg",frequency:"At onset",duration:"30 days"},{medicine:"Topiramate",dose:"25mg",frequency:"Once daily (evening)",duration:"60 days"}], notes:"Trigger diary recommended.", testReports:[] },
  ],
};

const TODAYS_APPOINTMENTS = [
  { id:"appt_1", patientId:"pat_1", time:"09:00", duration:20, status:"completed", type:"Follow-up", chief:"Routine BP & Sugar check" },
  { id:"appt_2", patientId:"pat_2", time:"09:30", duration:15, status:"completed", type:"New", chief:"Persistent cough for 2 weeks" },
  { id:"appt_3", patientId:"pat_3", time:"10:00", duration:25, status:"in_progress", type:"Follow-up", chief:"Chest pain follow-up" },
  { id:"appt_4", patientId:"pat_4", time:"10:45", duration:15, status:"waiting", type:"New", chief:"Breathing difficulty" },
  { id:"appt_5", patientId:"pat_5", time:"11:15", duration:30, status:"Follow-up", type:"Follow-up", chief:"COPD & BP review" },
  { id:"appt_6", patientId:"pat_6", time:"12:00", duration:20, status:"waiting", type:"Follow-up", chief:"Migraine frequency update" },
  { id:"appt_7", patientId:"pat_2", time:"14:00", duration:15, status:"waiting", type:"New", chief:"Lab results review" },
];

const WEEKLY_SCHEDULE = { Mon:{start:"09:00",end:"13:00"}, Tue:{start:"09:00",end:"17:00"}, Wed:{start:"09:00",end:"13:00"}, Thu:{start:"09:00",end:"17:00"}, Fri:{start:"09:00",end:"13:00"}, Sat:{start:"off",end:"off"}, Sun:{start:"off",end:"off"} };
const APPT_COUNTS = { Mon:7, Tue:5, Wed:3, Thu:8, Fri:4, Sat:0, Sun:0 };
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ═══════════════════════════════════════════════════════════════════════════
   2. STATUS CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  completed: { label:"Done", bg:"bg-emerald-100", text:"text-emerald-700", Icon: CheckCircle2 },
  in_progress: { label:"Seeing", bg:"bg-blue-100", text:"text-blue-700", Icon: Loader2 },
  waiting: { label:"Waiting", bg:"bg-amber-100", text:"text-amber-700", Icon: Circle },
};

/* ═══════════════════════════════════════════════════════════════════════════
   3. APPOINTMENT LIST (Left sidebar queue)
   ═══════════════════════════════════════════════════════════════════════════ */
function AppointmentList({ selectedId, onSelect }) {
  const [filter, setFilter] = useState("all");
  const completedCount = TODAYS_APPOINTMENTS.filter(a => a.status === "completed").length;
  const pct = Math.round((completedCount / TODAYS_APPOINTMENTS.length) * 100);

  const filtered = TODAYS_APPOINTMENTS.filter(a => {
    if (filter === "pending") return a.status !== "completed";
    if (filter === "done") return a.status === "completed";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Queue</span>
          <span className="text-xs text-gray-400">{TODAYS_APPOINTMENTS.length} patients</span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`, background:"linear-gradient(90deg,#10b981,#14b8a6)"}} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{completedCount} of {TODAYS_APPOINTMENTS.length} done</span>
          <span className="text-xs font-bold text-teal-600">{pct}%</span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1 px-3 py-1.5">
        {[["all","All"],["pending","Pending"],["done","Done"]].map(([k,l]) => (
          <button key={k} onClick={()=>setFilter(k)} className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${filter===k ? "bg-slate-800 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100"}`}>{l}</button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1" style={{maxHeight:"calc(100vh - 220px)"}}>
        {filtered.map(appt => {
          const p = PATIENTS[appt.patientId];
          const cfg = STATUS_CFG[appt.status] || STATUS_CFG.waiting;
          const active = selectedId === appt.id;
          return (
            <button key={appt.id} onClick={()=>onSelect(appt)} className={`w-full text-left rounded-xl border transition-all group ${active ? "border-slate-300 bg-slate-50 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}>
              <div className="flex items-start gap-3 p-3">
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${appt.status==="completed" ? "bg-gray-400" : "bg-gradient-to-br from-slate-600 to-slate-800"}`}>{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold truncate ${appt.status==="completed" ? "text-gray-400" : "text-gray-800"}`}>{p.name}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                      <cfg.Icon size={10} className={appt.status==="in_progress" ? "animate-spin" : ""} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10}/>{appt.time}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`text-xs font-semibold ${appt.type==="Follow-up" ? "text-indigo-600" : "text-emerald-600"}`}>{appt.type}</span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${appt.status==="completed" ? "text-gray-300" : "text-gray-500"}`}>{appt.chief}</p>
                </div>
                <ChevronRight size={14} className={`flex-shrink-0 mt-2 ${active ? "text-slate-500" : "text-gray-300 group-hover:text-gray-400"}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. PATIENT PROFILE
   ═══════════════════════════════════════════════════════════════════════════ */
function PatientProfile({ appointment }) {
  const p = PATIENTS[appointment.patientId];
  const visits = PAST_VISITS[p.id] || [];
  const [showPast, setShowPast] = useState(p.isFollowUp);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4" style={{background:"linear-gradient(135deg,#1e293b,#334155)"}}>
          <div className="w-13 h-13 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white/30" style={{background:"rgba(255,255,255,0.15)"}}>{p.avatar}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{p.name}</h3>
              {p.isFollowUp && <span className="text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 px-2 py-0.5 rounded-full font-semibold">Follow-up</span>}
            </div>
            <p className="text-slate-300 text-xs mt-0.5">{p.age}y • {p.gender} • Blood: {p.bloodType}</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-400 font-semibold">Phone</p><p className="text-xs text-gray-700 font-bold mt-0.5">{p.phone}</p></div>
            <div><p className="text-xs text-gray-400 font-semibold">Emergency</p><p className="text-xs text-gray-700 font-bold mt-0.5 truncate">{p.emergencyContact.name}</p></div>
          </div>
          {p.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
              <div><p className="text-xs font-bold text-red-700">Allergies</p><p className="text-xs text-red-600 mt-0.5">{p.allergies.join(", ")}</p></div>
            </div>
          )}
          {p.chronicConditions.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1"><Heart size={10}/> Chronic Conditions</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">{p.chronicConditions.map(c => <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">{c}</span>)}</div>
            </div>
          )}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 font-semibold">Today's Chief Complaint</p>
            <p className="text-xs text-gray-700 mt-0.5 font-bold">{appointment.chief}</p>
          </div>
        </div>
      </div>

      {/* Past visits */}
      {p.isFollowUp && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button onClick={()=>setShowPast(!showPast)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2"><FileText size={14} className="text-indigo-500"/><span className="text-sm font-bold text-gray-700">Past Visits</span><span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">{visits.length}</span></div>
            {showPast ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
          </button>
          {showPast && (
            <div className="px-3 pb-3 space-y-2">
              {visits.map(v => (
                <div key={v.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={()=>setExpanded(expanded===v.id?null:v.id)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2"><Calendar size={12} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{v.date}</span></div>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${expanded===v.id?"rotate-180":""}`}/>
                  </button>
                  {expanded===v.id && (
                    <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
                      <div><p className="text-xs text-gray-400 font-semibold">Complaint</p><p className="text-xs text-gray-600 mt-0.5">{v.chiefComplaint}</p></div>
                      <div><p className="text-xs text-gray-400 font-semibold">Diagnosis</p><p className="text-xs text-gray-700 font-bold mt-0.5">{v.diagnosis}</p></div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold">Prescription</p>
                        <div className="mt-1 space-y-1">{v.prescription.map((m,i) => (
                          <div key={i} className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                            <p className="text-xs font-bold text-slate-700">{m.medicine} <span className="font-normal text-slate-500">— {m.dose}</span></p>
                            <p className="text-xs text-slate-400">{m.frequency} • {m.duration}</p>
                          </div>
                        ))}</div>
                      </div>
                      {v.notes && <div><p className="text-xs text-gray-400 font-semibold">Notes</p><p className="text-xs text-gray-600 mt-0.5 italic">{v.notes}</p></div>}
                      {v.testReports.length > 0 && (
                        <div><p className="text-xs text-gray-400 font-semibold">Test Reports</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">{v.testReports.map(r => <span key={r} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">📄 {r}</span>)}</div>
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
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. RECORDING PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
function RecordingPanel({ onTranscriptReady, prescriptionStage, onGenerate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef(null);
  const prevRef = useRef("");

  const start = () => { setIsRecording(true); setElapsed(0); intervalRef.current = setInterval(()=>setElapsed(s=>s+1),1000); };
  const stop = () => {
    setIsRecording(false); clearInterval(intervalRef.current);
    const t = "Patient reports persistent chest tightness especially during morning walks. Denies shortness of breath at rest. Last medication taken this morning. Blood pressure reading today shows 148 over 92. Previous ECG was normal. Patient asks about switching to a different beta blocker due to fatigue side effect.";
    setTranscript(t);
  };
  useEffect(()=>{ if(transcript && transcript!==prevRef.current){ prevRef.current=transcript; onTranscriptReady?.(transcript); } },[transcript]);
  useEffect(()=>()=>clearInterval(intervalRef.current),[]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if(prescriptionStage==="ready"||prescriptionStage==="saved"||prescriptionStage==="printed") return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <style>{`@keyframes wb{from{height:15%}to{height:75%}}`}</style>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mic size={13} className={isRecording?"text-red-500":"text-gray-400"}/> Consultation Recording</h3>
        {isRecording && <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>Live</span>}
      </div>
      <div className="px-4 pb-4 space-y-3">
        {/* Waveform */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col items-center gap-2">
          <div className="w-full h-10 flex items-center justify-center gap-px">
            {Array.from({length:56}).map((_,i) => (
              <div key={i} className={`w-0.5 rounded-full ${isRecording?"bg-red-400":"bg-gray-200"}`}
                style={{height:isRecording?`${20+Math.sin(i*0.6)*30+Math.random()*10}%`:"25%", animation:isRecording?`wb ${0.5+(i%5)*0.12}s ease-in-out infinite alternate`:"none", animationDelay:`${i*0.04}s`}}/>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500"><Clock size={11}/><span className={`text-sm font-mono font-bold ${isRecording?"text-red-500":"text-gray-400"}`}>{fmt(elapsed)}</span></div>
        </div>

        {!transcript && (
          <button onClick={isRecording?stop:start} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${isRecording?"bg-red-500 hover:bg-red-600 text-white":"bg-slate-800 hover:bg-slate-700 text-white"}`}>
            {isRecording ? <><Square size={13} fill="currentColor"/><span>Stop Recording</span></> : <><Mic size={13}/><span>Start Recording</span></>}
          </button>
        )}

        {transcript && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full"/> Auto-transcript</p>
              <p className="text-xs text-slate-700 leading-relaxed">{transcript}</p>
            </div>
            {prescriptionStage==="idle" && (
              <button onClick={onGenerate} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all" style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)"}}>
                <Sparkles size={14}/> Generate Prescription
              </button>
            )}
            {prescriptionStage==="generating" && (
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm text-indigo-600 font-bold">Generating prescription…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. PRESCRIPTION EDITOR
   ═══════════════════════════════════════════════════════════════════════════ */
function PrescriptionEditor({ prescription, setPrescription, stage, onSave, onPrint, appointment }) {
  const p = PATIENTS[appointment.patientId];
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  if(!prescription) return null;

  const updateMed = (i,f,v) => { const m=[...prescription.medicines]; m[i]={...m[i],[f]:v}; setPrescription({...prescription,medicines:m}); };
  const removeMed = i => setPrescription({...prescription,medicines:prescription.medicines.filter((_,j)=>j!==i)});
  const addMed = () => setPrescription({...prescription,medicines:[...prescription.medicines,{medicine:"",dose:"",frequency:"",duration:"",notes:""}]});

  const handleUpload = e => {
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    setUploading(true);
    setTimeout(()=>{ setUploads(prev=>[...prev,...files.map(f=>f.name)]); setUploading(false); },800);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between" style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)"}}>
        <div><h3 className="text-white font-bold text-sm">✦ AI-Generated Prescription</h3><p className="text-indigo-200 text-xs mt-0.5">Review & edit before saving</p></div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${(stage==="saved"||stage==="printed") ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40" : "bg-white/20 text-white border border-white/30"}`}>
          {(stage==="saved"||stage==="printed") ? "✓ Saved" : "Draft"}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Diagnosis */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnosis</label>
          <textarea value={prescription.diagnosis} onChange={e=>setPrescription({...prescription,diagnosis:e.target.value})} className="w-full mt-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400" rows={2}/>
        </div>

        {/* Medicines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medicines</label>
            <button onClick={addMed} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"><Plus size={12}/> Add</button>
          </div>
          <div className="space-y-2">
            {prescription.medicines.map((med,i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/50 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">#{i+1}</span>
                  <button onClick={()=>removeMed(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"><Trash2 size={13}/></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[["medicine","Medicine"],["dose","Dose"],["frequency","Frequency"],["duration","Duration"]].map(([f,l]) => (
                    <div key={f}><p className="text-xs text-gray-400 mb-0.5">{l}</p><input value={med[f]} onChange={e=>updateMed(i,f,e.target.value)} className="w-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"/></div>
                  ))}
                </div>
                {med.notes && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1 border border-amber-200">💡 {med.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instructions</label>
          <textarea value={prescription.instructions} onChange={e=>setPrescription({...prescription,instructions:e.target.value})} className="w-full mt-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400" rows={2}/>
        </div>

        {/* Follow-up date */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Follow-up Date</label>
          <input type="date" value={prescription.followUpDate} onChange={e=>setPrescription({...prescription,followUpDate:e.target.value})} className="w-full mt-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"/>
        </div>

        {/* Upload test reports for follow-ups */}
        {p.isFollowUp && (
          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Upload size={11}/> Upload Test Reports</label>
            <label className="cursor-pointer block mt-1.5">
              <input type="file" multiple onChange={handleUpload} className="hidden" accept=".pdf,.jpg,.png"/>
              <div className="border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-xl p-3 text-center transition-colors">
                {uploading ? <div className="flex items-center justify-center gap-2"><div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/><span className="text-xs text-indigo-500 font-bold">Uploading…</span></div>
                : <><Upload size={16} className="mx-auto text-gray-300 mb-1"/><p className="text-xs text-gray-400">Drop PDF / Image or <span className="text-indigo-500 font-bold">browse</span></p></>}
              </div>
            </label>
            {uploads.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{uploads.map((r,i) => <span key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full"><FileText size={10}/>{r}</span>)}</div>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {stage==="ready" && <button onClick={onSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"><Save size={14}/> Save Prescription</button>}
          {(stage==="saved"||stage==="printed") && <button onClick={onPrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm transition-all"><Printer size={14}/> Print Prescription</button>}
        </div>
        {(stage==="saved"||stage==="printed") && <div className="flex items-center justify-center gap-2 pt-1"><CheckCircle2 size={13} className="text-emerald-500"/><span className="text-xs text-emerald-600 font-bold">{stage==="printed" ? "Prescription printed & saved." : "Prescription saved successfully."}</span></div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. CONSULTATION VIEW (orchestrator)
   ═══════════════════════════════════════════════════════════════════════════ */
function ConsultationView({ appointment, onBack }) {
  const p = PATIENTS[appointment.patientId];
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [pStage, setPStage] = useState("idle");
  const [prescription, setPrescription] = useState(null);

  const handleStart = () => { setStarted(true); setStartTime(new Date()); };

  const handleGenerate = () => {
    setPStage("generating");
    setTimeout(() => {
      setPrescription({
        diagnosis: "Stable Angina — mild exacerbation with orthostatic component",
        medicines: [
          { medicine:"Atenolol", dose:"50mg", frequency:"Once daily (morning)", duration:"30 days", notes:"Replaces previous beta-blocker; monitor for fatigue" },
          { medicine:"Atorvastatin", dose:"40mg", frequency:"Once daily (evening)", duration:"30 days", notes:"Continue as before" },
          { medicine:"Nitroglycerin (sublingual)", dose:"0.4mg", frequency:"As needed for chest pain", duration:"30 days", notes:"Under tongue, max 3 doses in 15 min" },
        ],
        instructions: "Avoid heavy physical exertion. Take medications as prescribed. Return if chest pain worsens or occurs at rest.",
        followUpDate: "2026-02-28",
      });
      setPStage("ready");
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft size={13}/> Back to Queue</button>
        <div className="flex items-center gap-2.5">
          {started && startTime && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11}/>{startTime.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${(pStage==="saved"||pStage==="printed") ? "bg-emerald-100 text-emerald-700" : started ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
            {(pStage==="saved"||pStage==="printed") ? "Completed" : started ? "In Progress" : "Not Started"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!started ? (
          <div className="p-4 space-y-4">
            <PatientProfile appointment={appointment}/>
            <button onClick={handleStart} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-md transition-all"><Play size={15} fill="currentColor"/> Start Consultation</button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Quick ref bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{p.avatar}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-700 truncate">{p.name}</p><p className="text-xs text-slate-400">{p.age}y • {p.gender} • {appointment.chief}</p></div>
              {p.allergies.length > 0 && <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold flex-shrink-0">⚠ {p.allergies.join(", ")}</span>}
            </div>

            <RecordingPanel onTranscriptReady={setTranscript} prescriptionStage={pStage} onGenerate={handleGenerate}/>

            {prescription && <PrescriptionEditor prescription={prescription} setPrescription={setPrescription} stage={pStage} onSave={()=>setPStage("saved")} onPrint={()=>setPStage("printed")} appointment={appointment}/>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. SCHEDULE PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
function SchedulePanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 pt-4 pb-2"><h3 className="text-sm font-bold text-gray-700">This Week</h3><p className="text-xs text-gray-400 mt-0.5">Feb 2 – 8, 2026</p></div>
      <div className="px-3 pb-4">
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(day => {
            const s = WEEKLY_SCHEDULE[day]; const isToday = day==="Mon"; const isOff = s.start==="off"; const cnt = APPT_COUNTS[day];
            return (
              <div key={day} className={`rounded-xl p-2 text-center ${isToday ? "shadow-md" : isOff ? "bg-gray-50 opacity-50" : "bg-gray-50"}`} style={isToday?{background:"#1e293b"}:{}}>
                <p className={`text-xs font-bold mb-1.5 ${isToday?"text-white":"text-gray-400"}`}>{day}</p>
                <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${isToday?"text-white":isOff?"bg-gray-100 text-gray-300":cnt>6?"bg-amber-100 text-amber-700":"bg-teal-50 text-teal-600"}`} style={isToday?{background:"rgba(255,255,255,0.2)"}:{}}>{isOff?"—":cnt}</div>
                <p className={`text-xs mt-1.5 font-bold ${isToday?"text-slate-300":"text-gray-400"}`}>{isOff?"Off":`${s.start.slice(0,2)}–${s.end.slice(0,2)}`}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-100 border border-teal-300"/><span className="text-xs text-gray-400">Normal</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300"/><span className="text-xs text-gray-400">Busy</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800"/><span className="text-xs text-gray-400">Today</span></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. ROOT — DOCTOR DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DoctorDashboard() {
  const [selected, setSelected] = useState(null);
  const completed = TODAYS_APPOINTMENTS.filter(a=>a.status==="completed").length;
  const waiting = TODAYS_APPOINTMENTS.filter(a=>a.status==="waiting"||a.status==="Follow-up").length;
  const inProg = TODAYS_APPOINTMENTS.filter(a=>a.status==="in_progress").length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      {/* ── Left sidebar ── */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        {/* Doctor header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0" style={{background:"linear-gradient(135deg,#334155,#1e293b)"}}>{CURRENT_DOCTOR.avatar}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{CURRENT_DOCTOR.name}</p><p className="text-xs text-gray-400">{CURRENT_DOCTOR.specialty}</p></div>
          <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><Bell size={16} className="text-gray-400"/><span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"/></button>
        </div>
        <div className="flex-1 overflow-hidden">
          <AppointmentList selectedId={selected?.id} onSelect={setSelected}/>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            <ConsultationView appointment={selected} onBack={()=>setSelected(null)}/>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Greeting + stats */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Good morning, <span className="text-slate-500">{CURRENT_DOCTOR.name.split(" ").pop()}</span></h1>
                  <p className="text-sm text-gray-400 mt-0.5">Monday, February 2 · 2026</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
                  <span className="font-bold">Online</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label:"Total Today", value:TODAYS_APPOINTMENTS.length, bg:"bg-orange-200", sub:"scheduled" },
                  { label:"Completed", value:completed, bg:"bg-green-200", sub:"finished" },
                  { label:"In Progress", value:inProg, bg:"bg-blue-200", sub:"seeing now" },
                  { label:"Waiting", value:waiting, bg:"bg-red-200", sub:"in queue" },
                ].map(s => (
                  <div key={s.label} className={cn("rounded-2xl p-6", s.bg)}>
                    <p className="text-xs font-bold opacity-70">{s.label}</p>
                    <p className="text-3xl font-bold mt-4 leading-none">{s.value}</p>
                    <p className="text-xs opacity-50 mt-2">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule + Reminders */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2"><SchedulePanel/></div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={13} className="text-indigo-500"/> Reminders</h3>
                <div className="space-y-2">
                  {[
                    { t:"Mohammad Hasan's stress test results pending", u:true },
                    { t:"Abdul Karim's pulmonary function test due", u:true },
                    { t:"Weekly report submission by Friday", u:false },
                    { t:"Staff meeting at 5:00 PM today", u:false },
                  ].map((r,i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${r.u?"bg-amber-50 border border-amber-200":"bg-gray-50 border border-gray-100"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${r.u?"bg-amber-500":"bg-gray-300"}`}/>
                      <p className={`text-xs ${r.u?"text-amber-700":"text-gray-500"}`}>{r.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}