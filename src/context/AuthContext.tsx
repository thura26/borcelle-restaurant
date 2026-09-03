import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export const ADMIN_EMAIL = "borcelle.admin@gmail.com";
export const ADMIN_PASS = "admin123";
const LEGACY_ADMIN_EMAIL = "seoulk.admin@gmail.com";

export type Role = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: "email" | "google";
  googleId?: string;
  avatar?: string;
  createdAt: number;
  role: Role;
  isActive: boolean;
};

type AuthContextType = {
  user: User | null;
  users: User[];
  isAdmin: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => { ok: boolean; msg: string; role?: Role };
  signup: (name: string, email: string, password: string) => { ok: boolean; msg: string; role?: Role };
  loginWithGoogle: () => { ok: boolean; msg: string; role?: Role };
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string, currentPassword?: string) => { ok: boolean; msg: string };
  updateAvatar: (dataUrl: string | null) => { ok: boolean; msg: string };
  changePassword: (oldPass: string, newPass: string) => { ok: boolean; msg: string };
  forgotPassword: (email: string) => { ok: boolean; msg: string; code?: string };
  resetPassword: (email: string, code: string, newPass: string) => { ok: boolean; msg: string };
  updateUserRole: (userId: string, role: Role) => { ok: boolean; msg: string };
  toggleUserActive: (userId: string) => { ok: boolean; msg: string };
  modalOpen: boolean;
  modalMode: "login" | "signup" | "forgot";
  modalMessage: string | null;
  openAuth: (mode?: "login" | "signup" | "forgot", message?: string) => void;
  closeAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function hash(p: string) {
  return btoa(p);
}

function getRoleForEmail(email: string): Role {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
}

function migrateUsers(raw: any[]): User[] {
  let arr: User[] = raw.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: (u.email || "").toLowerCase(),
    passwordHash: u.passwordHash || "",
    provider: u.provider || "email",
    googleId: u.googleId,
    avatar: u.avatar,
    createdAt: u.createdAt || Date.now(),
    role: (u.role as Role) || getRoleForEmail(u.email || ""),
    isActive: u.isActive !== undefined ? u.isActive : true,
  }));
  // purge legacy SeoulK admin
  arr = arr.filter((u) => u.email.toLowerCase() !== LEGACY_ADMIN_EMAIL.toLowerCase());
  // correct legacy name if present
  arr = arr.map((u) => (u.name === "SeoulK Admin" ? { ...u, name: "Borcelle Admin" } : u));
  // ensure Borcelle admin exists
  const adminExists = arr.some((x) => x.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  if (!adminExists) {
    const adminUser: User = {
      id: "ADMIN001",
      name: "Borcelle Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: hash(ADMIN_PASS),
      provider: "email",
      createdAt: Date.now() - 1000000,
      role: "admin",
      isActive: true,
    };
    arr = [adminUser, ...arr];
  } else {
    // force admin role even if previously user
    arr = arr.map((u) => (u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? { ...u, role: "admin" as Role, isActive: true, name: "Borcelle Admin" } : u));
  }
  return arr;
}

function loadUsers(): User[] {
  try {
    const legacy = localStorage.getItem("seoulk_users");
    const cur = localStorage.getItem("borcelle_users");
    const s = cur || legacy;
    if (legacy && !cur) { try { localStorage.setItem("borcelle_users", legacy); localStorage.removeItem("seoulk_users"); } catch {} }
    const raw = s ? JSON.parse(s) : [];
    if (!Array.isArray(raw)) return migrateUsers([]);
    return migrateUsers(raw);
  } catch {
    return migrateUsers([]);
  }
}
function saveUsers(u: User[]) {
  localStorage.setItem("borcelle_users", JSON.stringify(u));
  try { localStorage.removeItem("seoulk_users"); } catch {}
}

function loadAuthUser(): User | null {
  try {
    const legacy = localStorage.getItem("seoulk_auth_user");
    const cur = localStorage.getItem("borcelle_auth_user");
    const s = cur || legacy;
    if (legacy && !cur) { try { localStorage.setItem("borcelle_auth_user", legacy); localStorage.removeItem("seoulk_auth_user"); } catch {} }
    if (!s) return null;
    const u = JSON.parse(s);
    // purge legacy session
    if (u.email?.toLowerCase() === LEGACY_ADMIN_EMAIL.toLowerCase()) {
      localStorage.removeItem("borcelle_auth_user");
      try { localStorage.removeItem("seoulk_auth_user"); } catch {}
      return null;
    }
    // migrate single user too
    if (!u.role) u.role = getRoleForEmail(u.email || "");
    if (u.isActive === undefined) u.isActive = true;
    // force admin email check
    if (u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      u.role = "admin";
      u.name = "Borcelle Admin";
    }
    return u as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadAuthUser());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup" | "forgot">("login");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openAuth = (mode: "login" | "signup" | "forgot" = "login", message?: string) => {
    setModalMode(mode);
    setModalMessage(message || null);
    setModalOpen(true);
  };
  const closeAuth = () => setModalOpen(false);

  useEffect(() => {
    if (user) localStorage.setItem("borcelle_auth_user", JSON.stringify(user));
    else localStorage.removeItem("borcelle_auth_user");
    try { localStorage.removeItem("seoulk_auth_user"); } catch {}
  }, [user]);

  useEffect(() => {
    saveUsers(users);
    // keep current user in sync if users changed (e.g., role update)
    if (user) {
      const fresh = users.find((x) => x.id === user.id);
      if (fresh && (fresh.role !== user.role || fresh.isActive !== user.isActive || fresh.name !== user.name || fresh.email !== user.email || fresh.avatar !== user.avatar || fresh.passwordHash !== user.passwordHash)) {
        setUser(fresh);
      }
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (email: string, password: string) => {
    // auto-recover Borcelle admin if somehow missing (e.g. corrupted localStorage)
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const exists = users.some((x) => x.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (!exists) {
        const adminUser: User = {
          id: "ADMIN001",
          name: "Borcelle Admin",
          email: ADMIN_EMAIL.toLowerCase(),
          passwordHash: hash(ADMIN_PASS),
          provider: "email",
          createdAt: Date.now() - 1000000,
          role: "admin",
          isActive: true,
        };
        setUsers((prev) => [adminUser, ...prev.filter((x) => x.email.toLowerCase() !== LEGACY_ADMIN_EMAIL.toLowerCase())]);
        if (hash(password) === hash(ADMIN_PASS)) {
          setUser(adminUser);
          return { ok: true, msg: "Logged in", role: "admin" as Role };
        }
      }
    }
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, msg: "Account not found" };
    if (!u.isActive) return { ok: false, msg: "Account is deactivated. Contact admin." };
    if (u.provider === "google" && !u.passwordHash) return { ok: false, msg: "This email uses Google login" };
    if (u.passwordHash !== hash(password)) return { ok: false, msg: "Incorrect password" };
    setUser(u);
    return { ok: true, msg: "Logged in", role: u.role };
  };

  const signup = (name: string, email: string, password: string) => {
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) return { ok: false, msg: "Email already registered" };
    if (password.length < 8) return { ok: false, msg: "Password must be at least 8 characters" };
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) return { ok: false, msg: "Password needs upper, lower & number" };
    const role = getRoleForEmail(email);
    const nu: User = {
      id: "U" + Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: hash(password),
      provider: "email",
      createdAt: Date.now(),
      role,
      isActive: true,
    };
    setUsers((prev) => [...prev, nu]);
    // No auto-login: user must login after signup (1s success loading in modal)
    return { ok: true, msg: "Account created", role };
  };

  const loginWithGoogle = () => {
    const email = "google.user@gmail.com";
    let u = users.find((x) => x.email === email);
    if (u) {
      if (!u.isActive) return { ok: false, msg: "Account is deactivated" };
      setUser(u);
      return { ok: true, msg: "Logged in with Google", role: u.role };
    }
    const nu: User = {
      id: "G" + Date.now(),
      name: "Google User",
      email,
      passwordHash: "",
      provider: "google",
      googleId: "google_" + Date.now(),
      avatar: "https://picsum.photos/seed/google/100/100",
      createdAt: Date.now(),
      role: getRoleForEmail(email),
      isActive: true,
    };
    setUsers((prev) => [...prev, nu]);
    setUser(nu);
    return { ok: true, msg: "Signed up with Google", role: nu.role };
  };

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    // smooth delay so user sees loading animation — 1.4s feels natural
    await new Promise<void>((res) => setTimeout(res, 1400));
    setUser(null);
    // keep overlay a tiny moment after clearing user for polish
    await new Promise<void>((res) => setTimeout(res, 200));
    setIsLoggingOut(false);
  };

  const updateAvatar = (dataUrl: string | null) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    if (dataUrl && dataUrl.length > 5 * 1024 * 1024) return { ok: false, msg: "Image too large (max 5MB)" };
    const updated: User = { ...user, avatar: dataUrl || undefined };
    setUsers((prev) => prev.map((p) => (p.id === user.id ? updated : p)));
    setUser(updated);
    return { ok: true, msg: dataUrl ? "Avatar updated" : "Avatar removed" };
  };

  const updateProfile = (name: string, email: string, currentPassword?: string) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    const emailChanged = email.toLowerCase() !== user.email.toLowerCase();
    if (emailChanged) {
      if (users.some((x) => x.email.toLowerCase() === email.toLowerCase() && x.id !== user.id)) return { ok: false, msg: "Email already in use" };
      if (user.provider === "email" && (!currentPassword || hash(currentPassword) !== user.passwordHash)) return { ok: false, msg: "Current password required to change email" };
    }
    // prevent changing to admin email unless allowed? allow but role auto
    const newRole = getRoleForEmail(email);
    const updated: User = { ...user, name: name.trim(), email: email.toLowerCase(), role: newRole };
    setUsers((prev) => prev.map((p) => (p.id === user.id ? updated : p)));
    setUser(updated);
    return { ok: true, msg: "Profile updated" };
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    if (user.provider === "google") return { ok: false, msg: "Google accounts have no password" };
    if (hash(oldPass) !== user.passwordHash) return { ok: false, msg: "Current password incorrect" };
    if (newPass.length < 8) return { ok: false, msg: "New password must be 8+ chars" };
    if (!/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass)) return { ok: false, msg: "New password needs upper, lower & number" };
    const updated: User = { ...user, passwordHash: hash(newPass) };
    setUsers((prev) => prev.map((p) => (p.id === user.id ? updated : p)));
    setUser(updated);
    return { ok: true, msg: "Password changed" };
  };

  const forgotPassword = (email: string) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { ok: false, msg: "Email not found" };
    if (u.provider === "google") return { ok: false, msg: "Google account cannot reset via email" };
    const code = "123456";
    localStorage.setItem("borcelle_reset", JSON.stringify({ email: email.toLowerCase(), code, expiry: Date.now() + 5 * 60 * 1000 }));
    try { localStorage.removeItem("seoulk_reset"); } catch {}
    return { ok: true, msg: "Reset code sent", code };
  };

  const resetPassword = (email: string, code: string, newPass: string) => {
    const raw = localStorage.getItem("borcelle_reset") || localStorage.getItem("seoulk_reset");
    if (!raw) return { ok: false, msg: "No reset request found" };
    const data = JSON.parse(raw);
    if (data.email !== email.toLowerCase()) return { ok: false, msg: "Email mismatch" };
    if (data.code !== code) return { ok: false, msg: "Invalid code" };
    if (Date.now() > data.expiry) return { ok: false, msg: "Code expired" };
    if (newPass.length < 8) return { ok: false, msg: "Password must be 8+ chars" };
    const idx = users.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { ok: false, msg: "User not found" };
    const updated = { ...users[idx], passwordHash: hash(newPass) };
    const next = [...users];
    next[idx] = updated;
    setUsers(next);
    if (user && user.email.toLowerCase() === email.toLowerCase()) setUser(updated);
    localStorage.removeItem("borcelle_reset");
    try { localStorage.removeItem("seoulk_reset"); } catch {}
    return { ok: true, msg: "Password reset successful" };
  };

  const updateUserRole = (userId: string, role: Role) => {
    if (!user || user.role !== "admin") return { ok: false, msg: "Only admin can change roles" };
    if (userId === user.id) return { ok: false, msg: "Cannot change your own role" };
    const target = users.find((x) => x.id === userId);
    if (!target) return { ok: false, msg: "User not found" };
    if (target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return { ok: false, msg: "Cannot change primary admin" };
    if (role === "user") {
      const adminCount = users.filter((x) => x.role === "admin" && x.isActive).length;
      if (target.role === "admin" && adminCount <= 1) return { ok: false, msg: "At least one admin required" };
    }
    setUsers((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
    return { ok: true, msg: `Role updated to ${role}` };
  };

  const toggleUserActive = (userId: string) => {
    if (!user || user.role !== "admin") return { ok: false, msg: "Only admin can change status" };
    if (userId === user.id) return { ok: false, msg: "Cannot deactivate yourself" };
    const target = users.find((x) => x.id === userId);
    if (!target) return { ok: false, msg: "User not found" };
    if (target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return { ok: false, msg: "Cannot deactivate primary admin" };
    if (target.isActive) {
      const adminCount = users.filter((x) => x.role === "admin" && x.isActive).length;
      if (target.role === "admin" && adminCount <= 1) return { ok: false, msg: "At least one active admin required" };
    }
    setUsers((prev) => prev.map((p) => (p.id === userId ? { ...p, isActive: !p.isActive } : p)));
    return { ok: true, msg: target.isActive ? "User deactivated" : "User activated" };
  };

  const isAdmin = user?.role === "admin" && user.isActive;

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAdmin,
        isLoggingOut,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        updateAvatar,
        changePassword,
        forgotPassword,
        resetPassword,
        updateUserRole,
        toggleUserActive,
        modalOpen,
        modalMode,
        modalMessage,
        openAuth,
        closeAuth,
      }}
    >
      {children}
      {/* Global logout loading — simple & clean */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-dark/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl px-8 py-7 text-center shadow-xl border border-dark/5 min-w-[280px] max-w-[320px] w-full">
            <div className="w-10 h-10 mx-auto rounded-full bg-background border border-dark/5 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
            <h3 className="font-poppins font-semibold text-dark text-[15px] mt-3">Logging out...</h3>
            <p className="font-poppins text-muted text-xs mt-1">Please wait a moment</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
