import { createBrowserRouter } from "react-router-dom";
import { RoleLayout } from "./layouts/role-layout";

import LoginPage from "./pages/auth/login";
import RoleIndexPage from "./pages/role-index";

import AppointmentListPage from "./pages/common/appointment-list";
import DoctorListPage from "./pages/common/doctor-list";
import DepartmentListPage from "./pages/admin/departments";
import ConsultationPage from "./pages/doctors/consultation";
import ReceptionistListPage from "./pages/admin/receptionist-list";
import MessagePage from "./pages/common/messages";

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
        element: <DoctorListPage />,
      },
      {
        path: "departments",
        element: <DepartmentListPage />,
      },
      {
        path: "/appointments",
        element: <AppointmentListPage />,
      },
      {
        path: "/receptionist",
        element: <ReceptionistListPage />,
      },
      {
        path: "/doctors",
        element: <DoctorListPage />,
      },
      {
        path: "/consultation/:patientId",
        element: <ConsultationPage />,
      },
      {
        path: "/messages",
        element: <MessagePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
