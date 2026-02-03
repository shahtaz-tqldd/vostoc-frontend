import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar } from "../ui/avatar";
import { CURRENT_DOCTOR } from "@/pages/doctors/overview/mock_data";

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
        <div className="min-w-[220px]">
          <Input placeholder="Search patients, doctors, slots" />
        </div>
        <Button variant="secondary">New appointment</Button>
        <div className="flex items-center gap-2 rounded-full border border-ink-200/70 bg-white/70 px-3 py-2">
          <Avatar />
          <div className="text-xs">
            <div className="font-semibold text-ink-900">Ariana Lewis</div>
            <div className="text-ink-500">Ops Lead</div>
          </div>
        </div>
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
        <div className="min-w-[220px]">
          <Input placeholder="Search patients, doctors, slots" />
        </div>
        <Button variant="secondary">New appointment</Button>
        <div className="flex items-center gap-2 rounded-full border border-ink-200/70 bg-white/70 px-3 py-2">
          <Avatar />
          <div className="text-xs">
            <div className="font-semibold text-ink-900">Ariana Lewis</div>
            <div className="text-ink-500">Ops Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}
