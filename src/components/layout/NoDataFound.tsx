import { FolderOpen } from "lucide-react";

export default function NoDataFound({ title = "items" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 opacity-50">
      <FolderOpen size={32} strokeWidth={1} />
      <span className="capitalize tracking-wider text-sm">
        No {title} found
      </span>
    </div>
  );
}
