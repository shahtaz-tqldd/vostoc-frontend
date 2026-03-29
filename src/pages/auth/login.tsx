import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useLazyMeQuery } from "@/features/auth/authApi";
import { setCookie } from "@/lib/cookie";
import { useAppDispatch } from "@/app/hooks";
import type { Role } from "@/features/auth/authSlice";
import { setMe, setRole } from "@/features/auth/authSlice";
import { Stethoscope, GripVertical } from "lucide-react";

// Types
interface LoginPayload {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

// Test Login Configuration
const SHOW_TEST_LOGIN = true;

interface TestCredential {
  role: Role;
  username: string;
  password: string;
  displayName: string;
  color: string;
}

const TEST_CREDENTIALS: TestCredential[] = [
  {
    role: "doctor",
    username: "jane",
    password: "jane@123",
    displayName: "Dr. Jane Smith",
    color: "bg-blue-500",
  },
  {
    role: "admin",
    username: "admin",
    password: "admin123",
    displayName: "Admin User",
    color: "bg-purple-500",
  },
  {
    role: "receptionist",
    username: "nitu",
    password: "nitu@123",
    displayName: "Receptionist Nitu",
    color: "bg-green-500",
  },
];

// Helpers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;

function detectType(value: string): "email" | "phone" | "username" {
  if (EMAIL_RE.test(value)) return "email";
  if (PHONE_RE.test(value.replace(/\s/g, ""))) return "phone";
  return "username";
}

// Draggable Demo Panel Component
const DraggableDemoPanel: React.FC<{
  onAutoLogin: (credential: TestCredential) => void;
}> = ({ onAutoLogin }) => {
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startMousePos.current.x;
      const deltaY = e.clientY - startMousePos.current.y;

      setPosition({
        x: Math.max(
          0,
          Math.min(window.innerWidth - 320, startPos.current.x + deltaX),
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - 400, startPos.current.y + deltaY),
        ),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: position.x, y: position.y };
    startMousePos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div
      ref={dragRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Header */}
      <div
        className="bg-gray-800 text-white p-3"
        onMouseDown={handleMouseDown}
        style={{ cursor: "grab" }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-70" />
          <span className="font-semibold text-sm">Quick Access for Demo</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-600 mb-3">
          Click any role to auto-login
        </p>

        <div className="space-y-2">
          {TEST_CREDENTIALS.map((cred) => (
            <button
              key={cred.role}
              onClick={() => onAutoLogin(cred)}
              className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:bg-blue-100 tr text-left group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${cred.color} rounded-lg flex items-center justify-center text-white font-semibold`}
                >
                  {cred.role.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {cred.displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {cred.username} / {cred.password}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This application is currently in demo mode.
            Feel free to explore using the above credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const [showDemoPanel] = useState(SHOW_TEST_LOGIN);

  const identifierType = detectType(identifier);

  // Auto-login handler
  const handleAutoLogin = async (credential: TestCredential) => {
    setIdentifier(credential.username);
    setPassword(credential.password);

    // Simulate filling the form and submitting
    setTimeout(async () => {
      setLoading(true);
      setError(null);

      const payload: LoginPayload = {
        password: credential.password,
        username: credential.username,
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
        dispatch(setMe(me));

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
    }, 300);
  };

  // Submit
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
      dispatch(setMe(me));

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

  // Derived label for placeholder
  const placeholderMap: Record<string, string> = {
    email: "you@example.com",
    phone: "+880 1712-345678",
    username: "johndoe",
  };

  return (
    <div className="relative min-h-screen login-root">
      {/* Demo Panel */}
      {showDemoPanel && <DraggableDemoPanel onAutoLogin={handleAutoLogin} />}

      {/* Login Form */}
      <div className="login-card">
        <div className="login-logo">
          <Stethoscope className="text-blue-500 mx-auto" />
          <h1 className="mt-2">Vostoc Ops.</h1>
          <p>Appointment & Consultation management system</p>
        </div>

        <div className="">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Identifier field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flbx">
                Email, Phone, or Username
                {identifier.trim() && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      identifierType === "email"
                        ? "bg-blue-100 text-blue-700"
                        : identifierType === "phone"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {identifierType}
                  </span>
                )}
              </label>
              <div className="relative">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              disabled={loading || !identifier.trim() || !password}
              className="w-full bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Forgot password?{" "}
              <a
                href="#"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Reset here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
