import { useEffect, useState, type ChangeEvent } from "react";
import { CheckCircle2, FileText, Upload } from "lucide-react";

const ReportPanel = ({
  isFollowUp,
  onUploadsChange,
}: {
  isFollowUp: boolean;
  onUploadsChange?: (uploads: File[]) => void;
}) => {
  const [uploads, setUploads] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    onUploadsChange?.(uploads);
  }, [onUploadsChange, uploads]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setTimeout(() => {
      setUploads((prev) => [...prev, ...files]);
      setUploading(false);
    }, 800);
  };
  return (
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
          disabled={!isFollowUp}
        />
        <div
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isFollowUp ? "border-gray-200 hover:border-indigo-300" : "border-gray-100 bg-gray-50 text-gray-300"}`}
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
              <Upload size={18} className="mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">
                {isFollowUp
                  ? "Drop PDF / Image or browse"
                  : "Available for follow-up visits only"}
              </p>
            </>
          )}
        </div>
      </label>
      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {uploads.map((report, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full"
            >
              <FileText size={10} />
              {report.name}
            </span>
          ))}
        </div>
      )}
      {isFollowUp && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 size={12} className="text-emerald-500" />
          Attach reports to the patient's record for future visits.
        </div>
      )}
    </div>
  );
};

export default ReportPanel;
