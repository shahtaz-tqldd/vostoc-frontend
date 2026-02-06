import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CURRENT_DOCTOR } from "@/pages/doctors/overview/mock_data";
import { Plus, Search } from "lucide-react";

export type TopbarProps = {
  title: string;
  subtitle: string;
};

export function CommonTopbar({ title, subtitle }: TopbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          {title}
        </h2>
        <p className="text-sm text-ink-600">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            placeholder="Search patients, doctors, slots"
            className="h-9 !w-[260px] !pl-8"
          />
          <Search
            size={14}
            className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
          />
        </div>

        <Button variant="primary">
          <Plus size={14} />
          New appointment
        </Button>

        <Avatar className="h-9 w-9">
          <AvatarImage src={CURRENT_DOCTOR.avatar} alt={CURRENT_DOCTOR.name} />
          <AvatarFallback>
            {CURRENT_DOCTOR.name.split(" ")[1]?.charAt(0) ||
              CURRENT_DOCTOR.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export function DoctorTopbar() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Good morning,{" "}
          <span className="text-slate-500">
            {CURRENT_DOCTOR.name.split(" ").pop()}
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Monday, February 2 · 2026
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            placeholder="Search patients, reports"
            className="h-9 !w-[260px] !pl-8"
          />
          <Search
            size={14}
            className="opacity-50 absolute top-1/2 -translate-y-1/2 left-2.5"
          />
        </div>

        <Avatar className="h-9 w-9">
          <AvatarImage src={CURRENT_DOCTOR.avatar} alt={CURRENT_DOCTOR.name} />
          <AvatarFallback>
            {CURRENT_DOCTOR.name.split(" ")[1]?.charAt(0) ||
              CURRENT_DOCTOR.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
