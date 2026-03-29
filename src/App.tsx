import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { HealthCheckGate } from "./components/app/health-check-gate";

export default function App() {
  return (
    <HealthCheckGate>
      <RouterProvider router={routes} />
    </HealthCheckGate>
  );
}
