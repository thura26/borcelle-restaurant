import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useReservations } from "../context/ReservationContext";
import { useSettings } from "../context/SettingsContext";
import gsap from "gsap";
import { Calendar, AlertCircle } from "lucide-react";

type FormErrors = Partial<Record<"name" | "phone" | "guests" | "date" | "time", string>>;

export function Reservation() {
  const { user, openAuth } = useAuth();
  const { createReservation } = useReservations();
  const { settings, isStoreOpenNow } = useSettings();
  const storeStatus = isStoreOpenNow();
  const [form, setForm] = useState({ name: "", phone: "", guests: "", date: "", time: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [countdown, setCountdown] = useState(5);
  const successRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // date range: today to today+7 days, time: dynamic from settings
  const todayObj = new Date(); todayObj.setHours(0, 0, 0, 0);
  const toLocalStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = toLocalStr(todayObj);
  const maxDateObj = new Date(todayObj); maxDateObj.setDate(todayObj.getDate() + 7);
  const maxDateStr = toLocalStr(maxDateObj);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        // user has no phone in model, keep empty
      }));
    }
  }, [user]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\+?[\d\s\-()]{8,}$/.test(form.phone)) e.phone = "Invalid phone";
    if (!form.guests) e.guests = "Select guests";
    if (!form.date) e.date = "Select date";
    else {
      const selected = new Date(form.date);
      selected.setHours(0, 0, 0, 0);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const max = new Date(today); max.setDate(today.getDate() + 7);
      if (selected < today) e.date = "Past date not allowed";
      else if (selected > max) e.date = "Booking only within 7 days";
    }
    if (!form.time) e.time = "Select time";
    else {
      const [h, m] = form.time.split(":").map(Number);
      const mins = h * 60 + m;
      const [oh, om] = settings.openTime.split(":").map(Number);
      const [ch, cm] = settings.closeTime.split(":").map(Number);
      const openMins = oh * 60 + om;
      const closeMins = ch * 60 + cm;
      if (mins < openMins || mins > closeMins) e.time = `Open ${settings.openTime} – ${settings.closeTime} only`;
      if (!storeStatus.open) e.time = `Store closed — ${storeStatus.reason}`;
    }
    // also check closed days
    if (form.date) {
      const dayName = new Date(form.date).toLocaleDateString("en-US", { weekday: "long" });
      if (settings.closedDays.includes(dayName)) e.date = `Closed on ${dayName}`;
      if (!storeStatus.open && settings.closedDays.includes(new Date().toLocaleDateString("en-US", { weekday: "long" }))) {
        // already handled
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth("login", "Please login to reserve a table — signup if you don't have an account");
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const res = createReservation({
        userId: user?.id || null,
        name: form.name,
        phone: form.phone,
        guests: form.guests,
        date: form.date,
        time: form.time,
      });
      setBookingId(res.id);
      setLoading(false);
      setSuccess(true);
      setCountdown(5);
      setForm({ name: user?.name || "", phone: "", guests: "", date: "", time: "" });
    }, 1500);
  };

  useEffect(() => {
    if (loading && loadingRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".res-loading-ring", { rotation: 360, duration: 0.9, repeat: -1, ease: "linear" });
        gsap.fromTo(".res-loading-dot", { scale: 0.8, opacity: 0.6 }, { scale: 1.2, opacity: 1, duration: 0.6, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.15 });
      }, loadingRef);
      return () => ctx.revert();
    }
  }, [loading]);

  useEffect(() => {
    if (!success || !successRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".res-success-check", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" });
      gsap.fromTo(".res-success-circle", { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" });
      for (let i = 0; i < 14; i++) {
        const conf = document.createElement("div");
        conf.style.position = "absolute";
        conf.style.left = "50%";
        conf.style.top = "20%";
        conf.style.width = "8px";
        conf.style.height = "8px";
        conf.style.background = ["#C1272E", "#FFF0E6", "#1A1E1D", "#6B7280", "#FFD8B8"][i % 5];
        conf.style.borderRadius = i % 2 === 0 ? "50%" : "2px";
        conf.style.pointerEvents = "none";
        successRef.current?.appendChild(conf);
        gsap.to(conf, {
          x: (Math.random() - 0.5) * 280,
          y: Math.random() * 180 + 60,
          rotation: Math.random() * 720,
          opacity: 0,
          duration: 1.1 + Math.random() * 0.4,
          ease: "power2.out",
          delay: Math.random() * 0.2,
          onComplete: () => conf.remove(),
        });
      }
      gsap.from(".res-success-text", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, delay: 0.3 });
    }, successRef);
    return () => ctx.revert();
  }, [success]);

  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setSuccess(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return 5;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success]);

  return (
    <section id="reservation" className="bg-background pt-6 md:pt-8 pb-10 overflow-x-hidden">
      <div className="max-w-[1160px] mx-auto px-4 md:px-8">
        {!storeStatus.open && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="font-poppins font-semibold text-red-700 text-sm">Store is currently closed — {storeStatus.reason} • Will open {settings.openTime}-{settings.closeTime}</p>
          </div>
        )}
        {settings.announcement && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="font-poppins font-medium text-amber-800 text-sm">📢 {settings.announcement}</p>
          </div>
        )}
        <div className={`bg-primary rounded-xl md:rounded-lg p-4 md:p-8 lg:p-10 overflow-hidden ${!storeStatus.open ? "opacity-60" : ""}`}>
          <div className="text-center">
            <p className="font-poppins font-semibold text-background/90 text-[12px] md:text-[13px] tracking-[0.14em]">7 LEVELS • 1 SOUL</p>
            <h2 className="font-poppins font-bold text-background text-[24px] md:text-[30px] leading-[1.1] tracking-tight mt-1">KOREAN SPICY NOODLE HOUSE</h2>
            <p className="font-poppins text-background/70 text-xs mt-1">Open {settings.openTime} - {settings.closeTime} • {settings.closedDays.length ? `Closed ${settings.closedDays.join(", ")}` : "Open daily"}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 md:mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <div className="min-w-0">
                <label className="font-poppins font-medium text-background/90 text-[13px]">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter Name Here..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`mt-1.5 w-full max-w-full box-border rounded-sm px-3.5 py-3 text-[14px] font-poppins bg-background text-dark placeholder:text-dark/40 outline-none border min-h-[44px] ${errors.name ? "border-yellow-300" : "border-transparent"} focus:border-white/50`}
                />
                {errors.name && <p className="text-yellow-200 text-[12px] mt-1.5">{errors.name}</p>}
              </div>

              <div className="min-w-0">
                <label className="font-poppins font-medium text-background/90 text-[13px]">Phone Number</label>
                <input
                  type="tel"
                  placeholder="09 xxx xxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`mt-1.5 w-full max-w-full box-border rounded-sm px-3.5 py-3 text-[14px] font-poppins bg-background text-dark placeholder:text-dark/40 outline-none border min-h-[44px] ${errors.phone ? "border-yellow-300" : "border-transparent"} focus:border-white/50`}
                />
                {errors.phone && <p className="text-yellow-200 text-[12px] mt-1.5">{errors.phone}</p>}
              </div>

              <div className="min-w-0">
                <label className="font-poppins font-medium text-background/90 text-[13px]">Family Member</label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className={`mt-1.5 w-full max-w-full box-border rounded-sm px-3.5 py-3 text-[14px] font-poppins bg-background text-dark outline-none border appearance-none min-h-[44px] ${errors.guests ? "border-yellow-300" : "border-transparent"}`}
                >
                  <option value=""></option>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                  <option value="6">6+ People</option>
                </select>
                {errors.guests && <p className="text-yellow-200 text-[12px] mt-1.5">{errors.guests}</p>}
              </div>

              <div className="min-w-0">
                <label className="font-poppins font-medium text-background/90 text-[13px]">Date <span className="text-background/60 text-xs">(next 7 days)</span></label>
                <input
                  type="date"
                  value={form.date}
                  min={todayStr}
                  max={maxDateStr}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`mt-1.5 w-full max-w-full box-border rounded-sm px-3.5 py-3 text-[14px] font-poppins bg-background text-dark outline-none border min-h-[44px] min-w-0 block ${errors.date ? "border-yellow-300" : "border-transparent"} focus:border-white/50`}
                  style={{ WebkitAppearance: "none" } as React.CSSProperties}
                />
                {errors.date && <p className="text-yellow-200 text-[12px] mt-1.5">{errors.date}</p>}
              </div>

              <div className="min-w-0">
                <label className="font-poppins font-medium text-background/90 text-[13px]">Time <span className="text-background/60 text-xs">{settings.openTime}–{settings.closeTime}</span></label>
                <input
                  type="time"
                  value={form.time}
                  min={settings.openTime}
                  max={settings.closeTime}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={`mt-1.5 w-full max-w-full box-border rounded-sm px-3.5 py-3 text-[14px] font-poppins bg-background text-dark outline-none border min-h-[44px] min-w-0 block ${errors.time ? "border-yellow-300" : "border-transparent"} focus:border-white/50`}
                  style={{ WebkitAppearance: "none" } as React.CSSProperties}
                />
                {errors.time && <p className="text-yellow-200 text-[12px] mt-1.5">{errors.time}</p>}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`bg-white text-primary font-poppins font-bold text-[14px] tracking-[0.06em] px-10 py-3.5 min-h-[48px] rounded-full shadow-sm flex items-center gap-2 ${loading ? "opacity-70 cursor-wait" : "hover:bg-white transition-colors"}`}
              >
                {loading ? <><span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />Processing...</> : "RESERVE A TABLE"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div ref={loadingRef} className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-[380px] w-full p-8 text-center shadow-2xl border border-dark/5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="res-loading-ring absolute inset-0 rounded-full border-[3px] border-surface border-t-primary" />
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <Calendar size={20} className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="font-poppins font-bold text-dark text-[18px] mt-5 tracking-tight">Confirming reservation...</h3>
            <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">Please wait while we secure your table</p>
            <div className="flex justify-center gap-2 mt-5">
              <span className="res-loading-dot w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="res-loading-dot w-2.5 h-2.5 rounded-full bg-primary/70" />
              <span className="res-loading-dot w-2.5 h-2.5 rounded-full bg-primary/40" />
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={successRef} className="relative bg-white rounded-3xl max-w-[480px] w-full p-8 text-center overflow-hidden shadow-2xl">
            <div className="res-success-check w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center">
              <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
                <circle className="res-success-circle" cx="26" cy="26" r="22" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="200" />
                <path d="M14 27 L22 35 L38 18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="res-success-text font-poppins font-bold text-dark text-[22px] mt-5">Booking Confirmed!</h2>
            <p className="res-success-text font-poppins text-muted text-sm mt-2 leading-[1.75]">Thank you — your table is reserved with care.</p>
            <div className="res-success-text bg-background rounded-2xl p-4 mt-5 border border-dark/5">
              <p className="font-poppins font-bold text-dark text-sm">Booking ID</p>
              <p className="font-poppins font-bold text-primary text-xl tracking-wide">{bookingId}</p>
              <p className="font-poppins text-muted text-xs mt-2">{form.name ? "" : ""}{/* keep for layout */}Confirmed • Please arrive 10 min early</p>
              <p className="font-poppins text-muted text-xs">Check Account → Reservations for details</p>
            </div>
            <p className="res-success-text font-poppins text-muted text-xs mt-4">Closing in {countdown}s</p>
            <button onClick={() => { setSuccess(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="res-success-text mt-4 w-full bg-dark text-white font-poppins font-semibold py-3 rounded-full hover:bg-dark/90">Stay</button>
          </div>
        </div>
      )}
    </section>
  );
}
