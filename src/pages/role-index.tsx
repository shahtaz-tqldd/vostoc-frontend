import { useAppSelector } from "@/app/hooks";
import AdminOverviewPage from "@/pages/admin/overview";
import DoctorOverviewPage from "@/pages/doctors/overview";
import ReceptionistOverviewPage from "./receptionist/overview";
import { ROLES } from "@/config/role";

export default function RoleIndexPage() {
  const role = useAppSelector((state) => state.auth.role);

  if (role === ROLES.ADMIN) {
    return <AdminOverviewPage />;
  }

  if (role === ROLES.RECEPTIONIST) {
    return <ReceptionistOverviewPage />;
  }

  if (role === ROLES.DOCTOR) {
    return <DoctorOverviewPage />;
  }

  return null;
}
