import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useReservations } from "../context/ReservationContext";
import { formatMMK } from "../context/CartContext";
import { BRAND } from "../lib/brand";
import { User, Lock, Package, Calendar, CalendarDays, Clock, Users, Phone, CreditCard, Banknote, Tag, ArrowBigLeftDash, Loader2, LogOut } from "lucide-react";

export function Account() {
  const { user, updateProfile, updateAvatar, changePassword, logout, openAuth, isLoggingOut } = useAuth();
  const { getUserOrders, cancelOrder } = useOrders();
  const { getUserReservations, cancelReservation } = useReservations();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "reservations" | "profile" | "security">("orders");
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profilePass, setProfilePass] = useState("");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const [sec, setSec] = useState({ old: "", nw: "", confirm: "" });
  const [secMsg, setSecMsg] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);
  const [resCancelConfirm, setResCancelConfirm] = useState<string | null>(null);
  const [resMsg, setResMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-dark/5 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
            <User size={28} className="w-7 h-7 text-muted" />
          </div>
          <h2 className="font-poppins font-bold text-dark text-xl mt-4">Please login</h2>
          <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">You need to login to view your account and orders</p>
          <button onClick={() => openAuth("login", "Please login to view account")} className="mt-6 w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors">
            Login / Signup
          </button>
          <Link to="/" className="inline-flex items-center gap-1.5 mt-4 font-poppins text-muted text-sm hover:text-dark">
            <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const orders = getUserOrders(user.id);
  const reservations = getUserReservations(user.id);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setAvatarMsg("Only JPG/PNG allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setAvatarPreview(data);
      setAvatarMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarPreview) { setAvatarMsg("Please select an image"); return; }
    const r = await updateAvatar(avatarPreview);
    setAvatarMsg(r.msg);
    setTimeout(() => setAvatarMsg(null), 3000);
  };

  const handleAvatarRemove = async () => {
    const r = await updateAvatar(null);
    setAvatarPreview(null);
    setAvatarMsg(r.msg);
    setTimeout(() => setAvatarMsg(null), 3000);
  };

  const handleProfile = async () => {
    const r = await updateProfile(profile.name, profile.email, profilePass || undefined);
    setProfileMsg(r.msg);
    setTimeout(() => setProfileMsg(null), 3000);
  };
  const handlePass = async () => {
    if (sec.nw !== sec.confirm) { setSecMsg("New passwords do not match"); return; }
    const r = await changePassword(sec.old, sec.nw);
    setSecMsg(r.msg);
    if (r.ok) setSec({ old: "", nw: "", confirm: "" });
    setTimeout(() => setSecMsg(null), 3000);
  };

  const handleCancel = async (id: string) => {
    const r = await cancelOrder(id, user.id);
    setOrderMsg(r.msg);
    setCancelConfirm(null);
    setTimeout(() => setOrderMsg(null), 3000);
  };

  const handleResCancel = async (id: string) => {
    const r = await cancelReservation(id, user.id);
    setResMsg(r.msg);
    setResCancelConfirm(null);
    setTimeout(() => setResMsg(null), 3000);
  };

  const statusColor = (s: string) => {
    const v = s === "cancelled" ? "canceled" : s;
    if (v === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
    if (v === "confirmed") return "bg-sky-100 text-sky-700 border-sky-200";
    if (v === "delivered") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-red-100 text-red-700 border-red-200";
  };
  const normalizeStatus = (s: string) => (s === "cancelled" ? "canceled" : s);

  const formatDMY = (iso: string) => {
    if (!iso || !iso.includes("-")) return iso;
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };
  const formatCreatedDMY = (ts: number) => {
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  const formatTime12 = (t: string) => {
    if (!t || !t.includes(":")) return t;
    const [hStr, m] = t.split(":");
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-dark/5">
        <div className="max-w-[1160px] mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between">
          <Link to="/" className="shrink-0"><img src="/borcelle-logo.svg" alt={BRAND.fullName} className="h-10 md:h-11 w-auto object-contain" /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:block font-poppins font-medium text-muted text-sm">{user.name}</span>
            <button onClick={async () => { await logout(); navigate("/"); }} disabled={isLoggingOut} className="font-poppins font-semibold text-red-600 text-sm px-3 py-2 hover:text-red-700 disabled:opacity-60 flex items-center gap-1.5">
              {isLoggingOut ? <><Loader2 size={14} className="animate-spin" /> Logging out...</> : <><LogOut size={14} /> Logout</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-10 grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-dark/5 p-4 h-fit lg:sticky lg:top-[80px]">
          <div className="flex flex-col items-center gap-3 p-4 bg-background rounded-2xl">
            <div className="relative w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
              {avatarPreview || user.avatar ? <img src={avatarPreview || user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
            </div>
            <div className="text-center min-w-0">
              <p className="font-poppins font-bold text-dark text-sm truncate">{user.name}</p>
              <p className="font-poppins text-muted text-xs truncate">{user.email}</p>
              <p className="font-poppins text-muted text-[11px]">{user.provider === "google" ? "Google account" : "Email account"}</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {[
              { id: "orders", label: "My Orders", count: orders.length, Icon: Package },
              { id: "reservations", label: "Reservations", count: reservations.length, Icon: CalendarDays },
              { id: "profile", label: "Profile", Icon: User },
              { id: "security", label: "Security", Icon: Lock },
            ].map((it) => (
              <button
                key={it.id}
                onClick={() => setTab(it.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full font-poppins font-semibold text-sm transition-all ${tab === it.id ? "bg-dark text-white shadow-md" : "text-dark hover:bg-background"}`}
              >
                <it.Icon size={14} className="w-3.5 h-3.5 shrink-0" /> {it.label}
                {it.count !== undefined && <span className={`ml-auto text-xs px-2 py-1 rounded-full ${tab === it.id ? "bg-white/20 text-white" : "bg-surface text-dark"}`}>{it.count}</span>}
              </button>
            ))}
          </nav>

          <Link to="/" className="flex items-center justify-center gap-1.5 text-center mt-4 font-poppins font-medium text-muted text-sm hover:text-dark py-2">
            <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          {tab === "orders" && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              {orderMsg && <p className={`font-poppins text-sm mt-3 px-4 py-2.5 rounded-xl border ${orderMsg.includes("canceled") || orderMsg.includes("cancelled") || orderMsg.includes("confirmed") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{orderMsg}</p>}

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-surface flex items-center justify-center">
                    <Package size={28} className="w-7 h-7 text-muted" />
                  </div>
                  <p className="font-poppins font-semibold text-dark mt-4">No orders yet</p>
                  <p className="font-poppins text-muted text-sm mt-1">Your orders will appear here after checkout</p>
                  <Link to="/" className="inline-block mt-4 bg-primary text-white font-poppins font-semibold px-6 py-3 rounded-full">Order Now</Link>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {orders.map((o) => (
                    <div key={o.id} className="border border-dark/5 rounded-2xl p-4 bg-background/40 hover:bg-background transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-poppins font-bold text-primary text-sm tracking-wide">{o.id}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-dark flex items-center gap-1">
                              <Calendar size={12} className="w-3 h-3" /> {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-dark flex items-center gap-1">
                              <Clock size={12} className="w-3 h-3" /> {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-poppins font-semibold border flex items-center gap-1 ${o.payment === "kpay" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {o.payment === "kpay" ? <><CreditCard size={12} className="w-3 h-3" /> KPay</> : <><Banknote size={12} className="w-3 h-3" /> Cash On Delivery</>}
                            </span>
                            {o.promo ? <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-poppins font-bold flex items-center gap-1"><Tag size={12} className="w-3 h-3" /> {o.promo}</span> : <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins text-muted">No promo</span>}
                            <span className="px-2.5 py-1 rounded-full bg-surface border border-dark/5 text-[11px] font-poppins font-semibold text-dark">{o.items.length} items</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-poppins font-bold border shrink-0 ${statusColor(o.status)}`}>{normalizeStatus(o.status).toUpperCase()}</span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {o.items.map((it) => (
                          <div key={it.id} className="flex gap-3 bg-white rounded-xl p-2 border border-dark/5">
                            <img src={it.image} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-poppins font-semibold text-dark text-xs line-clamp-1">{it.name}</p>
                              <p className="font-poppins text-muted text-xs">Qty {it.qty} × {formatMMK(it.price)}</p>
                            </div>
                            <p className="font-poppins font-bold text-dark text-xs">{formatMMK(it.price * it.qty)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-dark/5">
                        <div>
                          <p className="font-poppins text-muted text-xs">Total</p>
                          <p className="font-poppins font-bold text-primary text-[16px]">{formatMMK(o.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-poppins text-muted text-xs">Delivery to</p>
                          <p className="font-poppins font-medium text-dark text-xs">{o.customer.address}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        {normalizeStatus(o.status) === "pending" ? (
                          <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(o.id); }} className="w-full bg-white border-2 border-red-200 text-red-600 font-poppins font-semibold text-sm py-2.5 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors">Cancel Order</button>
                        ) : normalizeStatus(o.status) === "canceled" ? (
                          <p className="font-poppins text-red-700 text-xs bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-center">Canceled</p>
                        ) : (
                          <p className="font-poppins text-muted text-xs bg-dark/5 border border-dark/10 rounded-full px-3 py-1.5 text-center">Admin confirmed — cannot cancel</p>
                        )}
                        {normalizeStatus(o.status) === "pending" && <p className="font-poppins text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-center">Pending — awaiting admin confirm</p>}
                        {normalizeStatus(o.status) === "confirmed" && <p className="font-poppins text-sky-700 text-xs bg-sky-50 border border-sky-200 rounded-full px-3 py-1.5 text-center">✓ Confirmed — on the way to delivered</p>}
                        {normalizeStatus(o.status) === "delivered" && <p className="font-poppins text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 text-center">✓ Delivered — enjoy your meal!</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "reservations" && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              {resMsg && <p className={`font-poppins text-sm mt-3 px-4 py-2.5 rounded-xl border ${resMsg.includes("cancelled") || resMsg.includes("confirmed") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{resMsg}</p>}
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-surface flex items-center justify-center">
                    <CalendarDays size={28} className="w-7 h-7 text-muted" />
                  </div>
                  <p className="font-poppins font-semibold text-dark mt-4">No reservations yet</p>
                  <p className="font-poppins text-muted text-sm mt-1">Reserve a table and it will appear here</p>
                  <button onClick={() => { setTab("orders"); document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" }); }} className="inline-block mt-4 bg-primary text-white font-poppins font-semibold px-6 py-3 rounded-full">Reserve Now</button>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {reservations.map((r) => (
                    <div key={r.id} className="border border-dark/5 rounded-2xl p-4 bg-background/40 hover:bg-background transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-poppins font-bold text-primary text-sm tracking-wide">{r.id}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-3 py-1.5 rounded-full bg-dark text-white text-[11px] font-poppins font-semibold flex items-center gap-1.5 shadow-sm"><CalendarDays size={12} className="w-3 h-3" /> Created: {formatCreatedDMY(r.createdAt)}</span>
                            <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-poppins font-semibold flex items-center gap-1.5 shadow-sm"><Calendar size={12} className="w-3 h-3" /> Booking: {formatDMY(r.date)}</span>
                            <span className="px-3 py-1.5 rounded-full bg-white border-2 border-primary/20 text-primary text-[11px] font-poppins font-bold flex items-center gap-1"><Clock size={12} className="w-3 h-3" /> {formatTime12(r.time)}</span>
                            <span className="px-3 py-1.5 rounded-full bg-surface border border-dark/5 text-[11px] font-poppins font-semibold text-dark flex items-center gap-1"><Users size={12} className="w-3 h-3" /> {r.guests} guests</span>
                          </div>
                          <p className="font-poppins text-dark text-xs mt-2 flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-white border border-dark/5 flex items-center justify-center"><User size={12} className="w-3 h-3" /></span> {r.name} <span className="flex items-center gap-1"><Phone size={12} className="w-3 h-3" /> {r.phone}</span></p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-poppins font-bold border shrink-0 ${statusColor(r.status)}`}>{r.status.toUpperCase()}</span>
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        {r.status === "pending" ? (
                          <button onClick={(e) => { e.stopPropagation(); setResCancelConfirm(r.id); }} className="w-full bg-white border-2 border-red-200 text-red-600 font-poppins font-semibold text-sm py-2.5 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors">Cancel Reservation</button>
                        ) : r.status === "cancelled" ? (
                          <p className="font-poppins text-red-700 text-xs bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-center">Cancelled</p>
                        ) : (
                          <p className="font-poppins text-muted text-xs bg-dark/5 border border-dark/10 rounded-full px-3 py-1.5 text-center">Confirmed — cannot cancel</p>
                        )}
                        {r.status === "pending" && <p className="font-poppins text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-center">Pending — awaiting admin confirm (auto in 5s)</p>}
                        {r.status === "confirmed" && <p className="font-poppins text-green-700 text-xs bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-center">✓ Confirmed — table reserved</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              <h2 className="font-poppins font-bold text-dark text-[18px]">Profile</h2>
              <p className="font-poppins text-muted text-sm mt-1">Change your avatar and details — JPG/PNG max 2MB</p>

              <div className="mt-6 flex flex-col items-center gap-4 bg-background rounded-2xl p-6 border border-dark/5">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-primary text-white flex items-center justify-center font-poppins font-bold text-2xl">
                  {avatarPreview || user.avatar ? <img src={avatarPreview || user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <label className="px-5 py-2.5 rounded-full bg-dark text-white font-poppins font-semibold text-sm cursor-pointer hover:bg-primary transition-colors">
                    Change Photo
                    <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  {(avatarPreview || user.avatar) && (
                    <button onClick={handleAvatarRemove} className="px-5 py-2.5 rounded-full bg-white border-2 border-dark/10 font-poppins font-semibold text-sm hover:border-red-200 hover:text-red-600">Remove</button>
                  )}
                  {avatarPreview && avatarPreview !== user.avatar && (
                    <button onClick={handleAvatarSave} className="px-5 py-2.5 rounded-full bg-primary text-white font-poppins font-semibold text-sm hover:bg-primary-hover">Save Photo</button>
                  )}
                </div>
                {avatarMsg && <p className={`font-poppins text-sm px-4 py-2 rounded-xl border text-center w-full ${avatarMsg.includes("updated") || avatarMsg.includes("removed") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{avatarMsg}</p>}
                <p className="font-poppins text-muted text-xs text-center">JPG or PNG, max 2MB • Recommended square 400x400</p>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="font-poppins font-medium text-dark text-[13px]">Full Name *</label>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="font-poppins font-medium text-dark text-[13px]">Email *</label>
                  <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                  {user.provider === "email" && <p className="font-poppins text-muted text-xs mt-1">Changing email requires current password</p>}
                </div>
                {user.provider === "email" && (
                  <div>
                    <label className="font-poppins font-medium text-dark text-[13px]">Current Password (if changing email)</label>
                    <input value={profilePass} onChange={(e) => setProfilePass(e.target.value)} type="password" placeholder="••••••••" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                  </div>
                )}
                {profileMsg && <p className={`font-poppins text-sm px-4 py-2.5 rounded-xl border ${profileMsg.includes("updated") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{profileMsg}</p>}
                <button onClick={handleProfile} className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors">Save Changes</button>

                <div className="bg-background rounded-xl p-4 border border-dark/5">
                  <p className="font-poppins font-semibold text-dark text-sm">Account Info</p>
                  <p className="font-poppins text-muted text-xs mt-1">ID: {user.id}</p>
                  <p className="font-poppins text-muted text-xs">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p className="font-poppins text-muted text-xs">Provider: {user.provider}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 sm:p-6 shadow-sm">
              <h2 className="font-poppins font-bold text-dark text-[18px]">Security</h2>
              <p className="font-poppins text-muted text-sm mt-1">Change your password</p>

              {user.provider === "google" ? (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="font-poppins font-semibold text-amber-800">Google account has no password</p>
                  <p className="font-poppins text-muted text-sm mt-1 leading-[1.75]">You logged in via Google — password change is not needed.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="font-poppins font-medium text-dark text-[13px]">Current Password *</label>
                    <input value={sec.old} onChange={(e) => setSec({ ...sec, old: e.target.value })} type="password" placeholder="Current" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                  </div>
                  <div>
                    <label className="font-poppins font-medium text-dark text-[13px]">New Password *</label>
                    <input value={sec.nw} onChange={(e) => setSec({ ...sec, nw: e.target.value })} type="password" placeholder="Min 8 chars, upper/lower/number" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                  </div>
                  <div>
                    <label className="font-poppins font-medium text-dark text-[13px]">Confirm New Password *</label>
                    <input value={sec.confirm} onChange={(e) => setSec({ ...sec, confirm: e.target.value })} type="password" placeholder="Repeat new password" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40" />
                  </div>
                  {secMsg && <p className={`font-poppins text-sm px-4 py-2.5 rounded-xl border ${secMsg.includes("changed") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{secMsg}</p>}
                  <button onClick={handlePass} className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors">Change Password</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {cancelConfirm && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl">
            <h3 className="font-poppins font-bold text-dark text-lg">Cancel order?</h3>
            <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">{cancelConfirm} will be cancelled. This cannot be undone before admin confirm.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 bg-background border-2 border-dark/10 font-poppins font-semibold py-3 rounded-full">No, Keep</button>
              <button onClick={() => handleCancel(cancelConfirm)} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {resCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl">
            <h3 className="font-poppins font-bold text-dark text-lg">Cancel reservation?</h3>
            <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">{resCancelConfirm} will be cancelled. Pending only.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setResCancelConfirm(null)} className="flex-1 bg-background border-2 border-dark/10 font-poppins font-semibold py-3 rounded-full">No, Keep</button>
              <button onClick={() => handleResCancel(resCancelConfirm)} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}