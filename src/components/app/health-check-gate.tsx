import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, Clock3, ServerCog } from "lucide-react";

type HealthStatus = "checking" | "warming" | "ready";

const HEALTH_RETRY_MS = 3000;
const TYPICAL_COLD_START_SECONDS = 50;

function getHealthUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/+$/, "")}/health`;
}

function WarmingScreen({ elapsedSeconds }: { elapsedSeconds: number }) {
  const isTakingLongerThanExpected =
    elapsedSeconds >= TYPICAL_COLD_START_SECONDS;

  return (
    <main className="healthcheck-root">
      <section className="healthcheck-shell">
        <div className="healthcheck-badge">
          <ServerCog size={18} />
          <span>Startup health check</span>
        </div>

        <div className="healthcheck-card">
          <div className="healthcheck-icon-wrap">
            <Activity className="healthcheck-pulse" size={28} />
          </div>

          <div className="healthcheck-copy">
            <h1>Server is warming up</h1>
            <p>
              Getting everything ready. Wait a moment while the app confirms
              the backend is available.
            </p>
          </div>

          <div className="healthcheck-meta">
            <div className="healthcheck-meta-item">
              <Clock3 size={16} />
              <span>{elapsedSeconds}s elapsed</span>
            </div>
            <div className="healthcheck-status">
              {isTakingLongerThanExpected
                ? "This is taking longer than a typical cold start."
                : "Waiting for the server to become ready."}
            </div>
          </div>

          <p className="healthcheck-note">
            Typically the server starts in around 30-50s for cold starts.
          </p>
        </div>
      </section>
    </main>
  );
}

export function HealthCheckGate({
  children,
}: {
  children: ReactNode;
}) {
  const healthUrl = useMemo(() => getHealthUrl(), []);
  const [status, setStatus] = useState<HealthStatus>(() =>
    healthUrl ? "checking" : "ready",
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!healthUrl) {
      return;
    }

    let isMounted = true;
    let retryTimeout: number | undefined;

    const tickInterval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    const checkHealth = async () => {
      try {
        const response = await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setStatus("ready");
          return;
        }
      } catch {
        if (!isMounted) {
          return;
        }
      }

      if (!isMounted) {
        return;
      }

      setStatus("warming");
      retryTimeout = window.setTimeout(checkHealth, HEALTH_RETRY_MS);
    };

    void checkHealth();

    return () => {
      isMounted = false;
      window.clearInterval(tickInterval);
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [healthUrl]);

  if (status !== "ready") {
    return <WarmingScreen elapsedSeconds={elapsedSeconds} />;
  }

  return <>{children}</>;
}
