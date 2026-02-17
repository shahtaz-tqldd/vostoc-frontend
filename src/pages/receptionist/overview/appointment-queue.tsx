import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, User, Stethoscope, Dot } from "lucide-react";
import { useGetAppointmentQueueQuery } from "@/features/appointment/appointmentApiSlice";
import NoDataFound from "@/components/layout/NoDataFound";

const AppointmentQueue = () => {
  const { data, isLoading, isError } = useGetAppointmentQueueQuery({});

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appointment Queue</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Loading queue...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appointment Queue</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          Failed to load queue.
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appointment Queue</CardTitle>
        </CardHeader>
        <CardContent className="pt-12 pb-16">
          <NoDataFound title="Patient in the Queue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((queue, index) => {
        const patient = queue.nextPatient;
        const leftForDoctor = queue.leftForDoctor ?? 0;

        if (!patient) return null;

        return (
          <Card key={index}>
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Stethoscope size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {queue.doctor?.name || "N/A"}
                  </CardTitle>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-600">
                      {queue.department?.name || "N/A"}
                    </p>
                    <Dot />
                    <p className="text-xs text-gray-500">
                      {queue.doctor?.specialty?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-blue-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Next Patient
                  </span>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {patient.name || "Unknown patient"}
                  </p>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-600 mt-1">
                      Age {patient.age ?? "N/A"} • {patient.gender || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                      <Phone size={12} />
                      {patient.contact || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs font-medium text-gray-500 text-center mt-2">
                {leftForDoctor} patient{leftForDoctor === 1 ? "" : "s"}{" "}
                remaining
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AppointmentQueue;
