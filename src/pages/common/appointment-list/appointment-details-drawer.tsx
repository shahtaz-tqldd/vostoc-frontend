import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { AppointmentRow } from ".";

interface AppointmentDetailsDrawerProps {
  viewingAppointment: AppointmentRow | null;
  setViewingAppointment: React.Dispatch<
    React.SetStateAction<AppointmentRow | null>
  >;
}

const AppointmentDetailsDrawer = ({
  viewingAppointment,
  setViewingAppointment,
}: AppointmentDetailsDrawerProps) => {
  return (
    <Drawer
      open={Boolean(viewingAppointment)}
      onOpenChange={(open) => {
        if (!open) {
          setViewingAppointment(null);
        }
      }}
    >
      <DrawerContent className="max-w-xl p-0">
        <div className="h-full overflow-y-auto">
          {viewingAppointment ? (
            <>
              <DrawerHeader className="mb-4 p-0">
                <DrawerTitle className="hidden"></DrawerTitle>
                <DrawerDescription className="hidden"></DrawerDescription>

                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {viewingAppointment.patient}
                  </p>
                  <p className="text-xs uppercase text-slate-500">
                    app-{viewingAppointment.id.slice(-6)}
                  </p>
                </div>
              </DrawerHeader>

              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Contact</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.patientPhone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Patient details</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.patientAge || "N/A"} •{" "}
                        {viewingAppointment.patientGender || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Doctor</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.doctor?.name || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Department</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.doctor?.department?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Time</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <p className="font-medium text-slate-900">
                        {viewingAppointment.status}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AppointmentDetailsDrawer;
