import ProfileItem from "@/components/layout/ProfileItem";
import { StatusBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { doctorLoads } from "@/data/mock";

function getFillPercentage(slotFill: string): number {
  if (slotFill.includes("%")) {
    return Math.min(100, Math.max(0, parseInt(slotFill)));
  }

  if (slotFill.includes("/")) {
    const [filled, total] = slotFill.split("/").map(Number);
    if (!total) return 0;
    return Math.min(100, Math.round((filled / total) * 100));
  }

  return 0;
}

export default function ActiveDoctorList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Doctor List</CardTitle>
        <CardDescription>Slots filled, by department</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3 mt-6">
        {doctorLoads.map((doctor) => {
          const percentage = getFillPercentage(doctor.slotFill);

          return (
            <div
              key={doctor.name}
              className="rounded-2xl border border-ink-200/70 bg-white/80 p-4"
            >
              {/* Top Section */}
              <div className="flex items-start justify-between">
                <ProfileItem
                  title={doctor.name}
                  image_url={doctor.avatar}
                  subtitle={doctor.department}
                />

                <StatusBadge label="Active" status="success" />
              </div>

              {/* Slot Info */}
              <div className="flex items-center justify-between text-xs text-ink-600 mt-6">
                <span>Slot Fill</span>
                <span className="font-medium">{doctor.slotFill}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mt-2.5">
                <div
                  className="h-full rounded-full bg-mint-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
