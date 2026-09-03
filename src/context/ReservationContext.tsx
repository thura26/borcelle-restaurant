import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";
export type Reservation = {
  id: string;
  userId: string | null;
  name: string;
  phone: string;
  guests: string;
  date: string;
  time: string;
  status: ReservationStatus;
  createdAt: number;
};

type ReservationContextType = {
  reservations: Reservation[];
  createReservation: (data: Omit<Reservation, "id" | "createdAt" | "status">) => Reservation;
  getUserReservations: (userId: string) => Reservation[];
  cancelReservation: (id: string, userId: string) => { ok: boolean; msg: string };
  confirmReservation: (id: string) => { ok: boolean; msg: string };
  confirmAllPending: () => number;
  updateStatus: (id: string, status: ReservationStatus) => { ok: boolean; msg: string };
  deleteReservation: (id: string) => { ok: boolean; msg: string };
};

const ReservationContext = createContext<ReservationContextType | null>(null);

function load(): Reservation[] {
  try {
    const legacy = localStorage.getItem("seoulk_reservations");
    const cur = localStorage.getItem("borcelle_reservations");
    const raw = cur || legacy;
    if (legacy && !cur) { try { localStorage.setItem("borcelle_reservations", legacy); localStorage.removeItem("seoulk_reservations"); } catch {} }
    const arr = raw ? JSON.parse(raw) : [];
    // migrate old entries without userId/status
    return arr.map((r: any) => ({
      id: r.id || "RB" + Math.random().toString().slice(2, 8),
      userId: r.userId ?? null,
      name: r.name || r.fullName || "",
      phone: r.phone || "",
      guests: r.guests || r.familyMember || "2",
      date: r.date || "",
      time: r.time || "",
      status: (r.status as ReservationStatus) || "confirmed",
      createdAt: r.createdAt || Date.now(),
    }));
  } catch { return []; }
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(() => load());

  useEffect(() => { localStorage.setItem("borcelle_reservations", JSON.stringify(reservations)); try { localStorage.removeItem("seoulk_reservations"); } catch {} }, [reservations]);

  const createReservation = (data: Omit<Reservation, "id" | "createdAt" | "status">) => {
    const r: Reservation = { id: "RB" + Date.now().toString().slice(-6), createdAt: Date.now(), status: "pending", ...data };
    setReservations((prev) => [r, ...prev]);
    // auto pending -> confirmed after 5s to allow cancel window (pending only)
    setTimeout(() => {
      setReservations((prev) => prev.map((x) => (x.id === r.id && x.status === "pending" ? { ...x, status: "confirmed" as ReservationStatus } : x)));
    }, 5000);
    return r;
  };

  const getUserReservations = (userId: string) => reservations.filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt);

  const cancelReservation = (id: string, userId: string) => {
    const r = reservations.find((x) => x.id === id && x.userId === userId);
    if (!r) return { ok: false, msg: "Reservation not found" };
    if (r.status !== "pending") return { ok: false, msg: "Admin confirmed — cannot cancel" };
    setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, status: "cancelled" as ReservationStatus } : x)));
    return { ok: true, msg: "Reservation cancelled" };
  };

  const confirmReservation = (id: string) => {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { ok: false, msg: "Not found" };
    if (r.status !== "pending") return { ok: false, msg: "Only pending can be confirmed" };
    setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, status: "confirmed" as ReservationStatus } : x)));
    return { ok: true, msg: "Reservation confirmed" };
  };

  const confirmAllPending = () => {
    let c = 0;
    setReservations((prev) => prev.map((r) => { if (r.status === "pending") { c++; return { ...r, status: "confirmed" as ReservationStatus }; } return r; }));
    return c;
  };

  const updateStatus = (id: string, status: ReservationStatus) => {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { ok: false, msg: "Not found" };
    setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    return { ok: true, msg: `Reservation ${status}` };
  };

  const deleteReservation = (id: string) => {
    if (!reservations.some((x) => x.id === id)) return { ok: false, msg: "Not found" };
    setReservations((prev) => prev.filter((x) => x.id !== id));
    return { ok: true, msg: "Reservation deleted" };
  };

  return (
    <ReservationContext.Provider value={{ reservations, createReservation, getUserReservations, cancelReservation, confirmReservation, confirmAllPending, updateStatus, deleteReservation }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservations must be within ReservationProvider");
  return ctx;
}
