import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

export default function NoDataFound({
  title = "items",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2.5 opacity-50", className)}
    >
      <FolderOpen size={32} strokeWidth={1} />
      <span className="capitalize tracking-wider text-sm">
        No {title} found
      </span>
    </div>
  );
}
