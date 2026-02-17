import NoDataFound from "@/components/layout/NoDataFound";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetActiveDoctorsQuery } from "@/features/doctors/doctorsApi";
import type { ActiveDoctor } from "@/features/doctors/type";

function getFillPercentage(completed: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

export default function ActiveDoctorList() {
  const { data, isLoading } = useGetActiveDoctorsQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Doctor List</CardTitle>
        <CardDescription>Slots filled, by department</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3 mt-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))
        ) : !data?.data || data?.data.length === 0 ? (
          <NoDataFound title="Active Doctors" className="col-span-2 py-12" />
        ) : (
          data.data.map((item: ActiveDoctor) => {
            const percentage = getFillPercentage(
              item.completedAppointments,
              item.totalAppointments,
            );

            return (
              <div
                key={item.doctorId}
                className="rounded-2xl border border-ink-200/70 bg-white/80 p-4"
              >
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={item.profileImageUrl || undefined}
                        alt={item.name}
                      />
                      <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="text-sm font-semibold text-ink-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-ink-500">
                        {item.department.name}
                      </div>
                    </div>
                  </div>

                  <StatusBadge label="Active" status="success" />
                </div>

                {/* Slot Info */}
                <div className="flex items-center justify-between text-xs text-ink-600 mt-6">
                  <span>Slot Fill</span>
                  <span className="font-medium">
                    {item.completedAppointments}/{item.totalAppointments}
                  </span>
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
          })
        )}
      </CardContent>
    </Card>
  );
}

function DoctorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}
