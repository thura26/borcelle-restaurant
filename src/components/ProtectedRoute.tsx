import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) {
    // if admin go to admin else home
    const target = user.role === "admin" ? "/admin" : "/";
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}