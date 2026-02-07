import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RoleIndexPage from "./pages/role-index";
import { RoleLayout } from "./layouts/role-layout";
import AppointmentListPage from "./pages/common/appointment-list";
import DoctorListPage from "./pages/common/doctor-list";
import DoctorsLayout from "./pages/admin/doctors-layout";
import DepartmentListPage from "./pages/admin/department-list";
import ConsultationPage from "./pages/doctors/consultation";
import ReceptionistListPage from "./pages/admin/receptionist-list";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RoleLayout />,
    children: [
      {
        index: true,
        element: <RoleIndexPage />,
      },
      {
        path: "/doctors",
        element: <DoctorsLayout />,
        children: [
          {
            path: "list",
            element: <DoctorListPage />,
          },
          {
            path: "departments",
            element: <DepartmentListPage />,
          },
        ],
      },
      {
        path: "/appointment-list",
        element: <AppointmentListPage />,
      },
      {
        path: "/receptionist",
        element: <ReceptionistListPage />,
      },
      {
        path: "/consultation/:patientId",
        element: <ConsultationPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
