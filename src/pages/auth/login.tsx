import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useLazyMeQuery } from "@/features/auth/authApi";
import { setCookie } from "@/lib/cookie";
import { useAppDispatch } from "@/app/hooks";
import type { Role } from "@/features/auth/authSlice";
import { setRole } from "@/features/auth/authSlice";
import { Stethoscope } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

interface LoginPayload {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;

function detectType(value: string): "email" | "phone" | "username" {
  if (EMAIL_RE.test(value)) return "email";
  if (PHONE_RE.test(value.replace(/\s/g, ""))) return "phone";
  return "username";
}

// ─── Component ────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const [fetchMe] = useLazyMeQuery();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifierType = detectType(identifier);

  // ─── Submit ─────────────────────────────────────────────────────────
  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setError(null);
    const identifierValue = identifier.trim();
    const type = detectType(identifierValue);

    const payload: LoginPayload = {
      password,
      ...(type === "email"
        ? { email: identifierValue }
        : type === "phone"
          ? { phone: identifierValue }
          : { username: identifierValue }),
    };

    interface ErrorResponse {
      message?: string;
    }

    const normalizeRole = (value?: string): Role | null => {
      if (!value) return null;
      const role = value.toLowerCase();
      if (role === "admin" || role === "doctor" || role === "receptionist") {
        return role;
      }
      return null;
    };

    try {
      const data = await login(payload).unwrap();
      setCookie("token", data.token);

      const me = await fetchMe(undefined).unwrap();
      const normalizedRole = normalizeRole(me.role);
      if (normalizedRole) {
        dispatch(setRole(normalizedRole));
      }

      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const apiError = err as { data?: ErrorResponse };
        setError(apiError.data?.message || "Login failed");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived label for placeholder ─────────────────────────────────
  const placeholderMap: Record<string, string> = {
    email: "you@example.com",
    phone: "+880 1712-345678",
    username: "johndoe",
  };

  return (
    <>
      <div className="login-root">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="bg-gray-800 h-12 w-12 flex items-center justify-center rounded-xl mx-auto">
              <Stethoscope className="text-white" />
            </div>
            <h1 className="mt-2">Vostoc Sys</h1>
            <p>Appointment management system</p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <svg
                className="err-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Identifier field */}
            <div className="field-group">
              <label className="field-label">
                <span>Email, Phone, or Username</span>
                {identifier.trim() && (
                  <span className={`type-badge ${identifierType}`}>
                    {identifierType}
                  </span>
                )}
              </label>
              <div className="input-wrap">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={placeholderMap[identifierType]}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="field-group">
              <label className="field-label">
                <span>Password</span>
              </label>
              <div className="input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="pw-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !identifier.trim() || !password}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  Sign in
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              Forgot password? <a href="#">Reset here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
