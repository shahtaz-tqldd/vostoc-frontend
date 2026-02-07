import { useAppSelector } from "@/app/hooks";
import AdminOverviewPage from "@/pages/admin/overview";
import DoctorOverviewPage from "@/pages/doctors/overview";
import ReceptionistOverviewPage from "./receptionist/overview";

export default function RoleIndexPage() {
  const role = useAppSelector((state) => state.auth.role);

  if (role === "admin") {
    return <AdminOverviewPage />;
  }
  if (role === "receptionist") {
    return <ReceptionistOverviewPage />;
  }

  return <DoctorOverviewPage />;
}
