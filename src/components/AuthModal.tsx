import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Eye, EyeOff, Globe, ArrowBigLeftDash, X, Loader2 } from "lucide-react";
import { BRAND } from "../lib/brand";
import { Logo } from "./Logo";

type Props = {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "forgot";
  message?: string;
};

export function AuthModal({
  open,
  onClose,
  initialMode = "login",
  message,
}: Props) {
  const { login, signup, loginWithGoogle, forgotPassword, resetPassword } =
    useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    initialMode,
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [showResetCode, setShowResetCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);
  useEffect(() => {
    if (open && message) setMsg({ text: message, ok: false });
    else if (open) setMsg(null);
  }, [open, message]);

  // auto clear toast after 3s
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  // auto clear all inputs when switching between login/signup + hide toasts
  useEffect(() => {
    setForm({ name: "", email: "", password: "", confirm: "" });
    setForgotEmail("");
    setResetCode("");
    setResetPass("");
    setShowResetCode(null);
    setShowPass(false);
    // clear toasts that should not persist
    setMsg((prev) =>
      prev &&
      (prev.text === "Create your account" ||
        prev.text === "Please login to continue")
        ? null
        : prev,
    );
  }, [mode]);

  useEffect(() => {
    if (!open || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { scale: 0.96, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, [open, mode]);

  if (!open) return null;

  const handleLogin = async () => {
    if (loginLoading || signupLoading) return;
    setLoginLoading(true);
    setMsg(null);
    try {
      const r = await login(form.email, form.password);
      if (r.ok && (r as any).role === "admin") {
        setMsg({ text: "Admin login → redirecting to Dashboard", ok: true });
        setTimeout(() => {
          onClose();
          navigate("/admin");
        }, 700);
        return;
      }
      setMsg({ text: r.msg, ok: r.ok });
      if (r.msg === "This email uses Google login") {
        setForm({ name: "", email: "", password: "", confirm: "" });
      }
      if (r.ok) setTimeout(onClose, 700);
    } catch (e: any) {
      setMsg({ text: e?.message || "Login failed", ok: false });
    } finally {
      setLoginLoading(false);
    }
  };
  const handleSignup = async () => {
    if (form.password !== form.confirm) {
      setMsg({ text: "Passwords do not match", ok: false });
      return;
    }
    if (loginLoading || signupLoading) return;
    setSignupLoading(true);
    setMsg(null);
    try {
      const r = await signup(form.name, form.email, form.password);
      if (r.ok) {
        setMsg({ text: "Sign up successful! Please login →", ok: true });
        const emailToKeep = form.email;
        setForm({ name: "", email: emailToKeep, password: "", confirm: "" });
        setTimeout(() => {
          setMode("login");
          setMsg({
            text: "Account created. Please login with your new credentials",
            ok: true,
          });
        }, 900);
      } else {
        setMsg({ text: r.msg, ok: r.ok });
      }
    } catch (e: any) {
      setMsg({ text: e?.message || "Signup failed", ok: false });
    } finally {
      setSignupLoading(false);
    }
  };
  const handleGoogle = async () => {
    try {
      const r = await loginWithGoogle();
      if (r.ok && (r as any).role === "admin") {
        setMsg({ text: "Admin login → Dashboard", ok: true });
        setTimeout(() => {
          onClose();
          navigate("/admin");
        }, 600);
        return;
      }
      setMsg({ text: r.msg, ok: r.ok });
      if (r.ok) setTimeout(onClose, 600);
    } catch (e: any) {
      setMsg({ text: e?.message || "Google login failed", ok: false });
    }
  };
  const handleForgot = async () => {
    try {
      const r = await forgotPassword(forgotEmail);
      if (r.ok) {
        setShowResetCode(r.code || "123456");
        setMsg({ text: r.code ? `Demo code: ${r.code} (expires 5 min) — also email sent` : r.msg, ok: true });
        setMode("reset");
      } else setMsg({ text: r.msg, ok: false });
    } catch (e: any) {
      setMsg({ text: e?.message || "Failed", ok: false });
    }
  };
  const handleReset = async () => {
    try {
      const r = await resetPassword(forgotEmail, resetCode, resetPass);
      setMsg({ text: r.msg, ok: r.ok });
      if (r.ok)
        setTimeout(() => {
          setMode("login");
          setMsg({ text: "Password reset. Please login", ok: true });
        }, 800);
    } catch (e: any) {
      setMsg({ text: e?.message || "Failed", ok: false });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-[440px] max-h-[92vh] md:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        <div className="sticky top-0 bg-white rounded-t-3xl p-6 pb-4 border-b border-dark/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="auth" className="!justify-start" />
            <p className="font-poppins text-muted text-xs">
              {mode === "login"
                ? "Welcome back"
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Forgot password"
                    : "Reset password"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-dark/5 hover:bg-dark/10 flex items-center justify-center shrink-0"
          >
            <X size={16} className="w-4 h-4 text-dark" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          {(mode === "login" || mode === "signup") && (
            <div className="flex bg-background rounded-full p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${mode === "login" ? "bg-dark text-white shadow" : "text-muted"}`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${mode === "signup" ? "bg-dark text-white shadow" : "text-muted"}`}
              >
                Signup
              </button>
            </div>
          )}

          {mode === "signup" && (
            <>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aung Aung"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  type="email"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Password *
                </label>
                <div className="relative mt-1.5">
                  <input
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    type={showPass ? "text" : "password"}
                    placeholder="Min 8 chars, upper/lower/number"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted flex items-center justify-center"
                  >
                    {showPass ? (
                      <EyeOff size={16} className="w-4 h-4" />
                    ) : (
                      <Eye size={16} className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Confirm Password *
                </label>
                <input
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  type="password"
                  placeholder="Repeat password"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                />
              </div>
              <button
                onClick={handleSignup}
                disabled={signupLoading || loginLoading}
                className={`w-full font-poppins font-semibold py-3.5 rounded-full shadow-md min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${signupLoading ? "bg-dark/60 text-white cursor-wait" : "bg-primary text-white hover:bg-primary-hover"}`}
              >
                {signupLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </>
          )}

          {mode === "login" && (
            <>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  type="email"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="font-poppins font-medium text-dark text-[13px]">
                  Password *
                </label>
                <div className="relative mt-1.5">
                  <input
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted flex items-center justify-center"
                  >
                    {showPass ? (
                      <EyeOff size={16} className="w-4 h-4" />
                    ) : (
                      <Eye size={16} className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setMode("forgot")}
                  className="font-poppins text-primary text-xs font-medium mt-2 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <button
                onClick={handleLogin}
                disabled={loginLoading || signupLoading}
                className={`w-full font-poppins font-semibold py-3.5 rounded-full shadow-md min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${loginLoading ? "bg-dark/60 text-white cursor-wait" : "bg-primary text-white hover:bg-primary-hover"}`}
              >
                {loginLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </>
          )}

          {(mode === "login" || mode === "signup") && (
            <>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-dark/10" />
                <span className="font-poppins text-muted text-xs">or</span>
                <div className="flex-1 h-px bg-dark/10" />
              </div>
              <button
                onClick={handleGoogle}
                className="w-full bg-white border-2 border-dark/10 hover:border-dark/20 font-poppins font-semibold text-dark text-sm py-3.5 rounded-full flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center">
                  <Globe size={14} className="w-3.5 h-3.5 text-dark" />
                </span>{" "}
                Continue with a Guest
              </button>
              <p className="font-poppins text-muted text-xs text-center">
                {mode === "login" ? "No account? " : "Already have account? "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Signup" : "Login"}
                </button>
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <p className="font-poppins text-muted text-sm leading-[1.75]">
                Enter your email — we'll send a demo code{" "}
                <span className="font-semibold text-dark">123456</span>
              </p>
              <input
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@email.com"
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
              />
              <button
                onClick={handleForgot}
                className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors"
              >
                Send Reset Code
              </button>
              <button
                onClick={() => setMode("login")}
                className="w-full font-poppins font-medium text-muted text-sm hover:text-dark flex items-center justify-center gap-1.5"
              >
                <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Login
              </button>
            </>
          )}

          {mode === "reset" && (
            <>
              {showResetCode && (
                <p className="font-poppins text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                  Demo code: <span className="font-bold">{showResetCode}</span>{" "}
                  (email: {forgotEmail})
                </p>
              )}
              <input
                value={forgotEmail}
                disabled
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-dark/10 bg-background/60 text-sm font-poppins"
              />
              <input
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter code 123456"
                className="w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
              />
              <input
                value={resetPass}
                onChange={(e) => setResetPass(e.target.value)}
                type="password"
                placeholder="New password (8+ upper/lower/number)"
                className="w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
              />
              <button
                onClick={handleReset}
                className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors"
              >
                Reset Password
              </button>
              <button
                onClick={() => setMode("login")}
                className="w-full font-poppins font-medium text-muted text-sm hover:text-dark flex items-center justify-center gap-1.5"
              >
                <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Login
              </button>
            </>
          )}
        </div>

        <div className="px-6 pb-6">
          <p className="font-poppins text-muted text-[11px] text-center leading-[1.6]">
            By continuing, you agree to {BRAND.fullName} Terms & Privacy
          </p>
        </div>
      </div>
      {msg &&
        msg.text !== "Create your account" &&
        msg.text !== "Please login to continue" && (
          <div
            className={`fixed bottom-6 right-6 max-w-[360px] px-5 py-3.5 rounded-2xl text-sm font-poppins border shadow-xl z-[80] ${msg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}
          >
            {msg.text}
          </div>
        )}
    </div>
  );
}