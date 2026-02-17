import NoDataFound from "@/components/layout/NoDataFound";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const TodaysSchedule = () => {
  const { data, isLoading } = useGetActiveDoctorsQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
        <CardDescription>
          Active doctors and their schedules for today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 mt-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <DoctorLoadSkeleton key={index} />
          ))
        ) : !data?.data || data.data.length === 0 ? (
          <NoDataFound title="Active Doctors" className="py-12" />
        ) : (
          data.data.map((doctor: ActiveDoctor) => (
            <div
              key={doctor.doctorId}
              className="rounded-2xl border border-ink-200/70 bg-white/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={doctor.profileImageUrl || undefined}
                      alt={doctor.name}
                    />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">
                      {doctor.name}
                    </div>
                    <div className="text-xs text-ink-500">
                      {doctor.department.name}
                    </div>
                  </div>
                </div>
                <Badge variant="mint">
                  {doctor.completedAppointments}/{doctor.totalAppointments}
                </Badge>
              </div>
              <div className="mt-4 text-xs text-ink-500 font-medium">
                Today's schedule:{" "}
                {doctor.todaysSchedules && doctor.todaysSchedules.length > 0
                  ? doctor.todaysSchedules
                      .map(
                        (schedule) =>
                          `${schedule.startTime} - ${schedule.endTime}`,
                      )
                      .join(", ")
                  : "No schedule today"}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysSchedule;

function DoctorLoadSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
