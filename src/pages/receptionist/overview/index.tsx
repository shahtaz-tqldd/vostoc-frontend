import TodaysAppointmentQueue from "./todays-appointment";
import ActiveDoctorList from "./active-doctor-list";
import AppointmentQueue from "./appointment-queue";
import AppointmentStats from "@/pages/common/components/appointment-status";

export default function ReceptionistOverviewPage() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-4">
        <AppointmentStats />
        <TodaysAppointmentQueue />
        <ActiveDoctorList />
      </div>
      <div className="col-span-1 space-y-4">
        <AppointmentQueue />
      </div>
    </div>
  );
}
