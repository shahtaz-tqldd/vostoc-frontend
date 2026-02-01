import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard-layout";
import PrescribePage from "./pages/doctors/prescribe";
import OverviewPage from "./pages/doctors/overview";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <OverviewPage />,
      },
      {
        path: "/prescribe",
        element: <PrescribePage />,
      },
    ],
  },
  // {
  //   path: "/login",
  //   element: <LoginPage />,
  // },
  // {
  //   path: "/sign-up",
  //   element: <RegisterPage />,
  // },
  // {
  //   path: "/forget-password",
  //   element: <ForgotPasswordPage />,
  // },
  // {
  //   path: "/reset-password",
  //   element: <ResetPasswordPage />,
  // },
]);
