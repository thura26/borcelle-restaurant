import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart, formatMMK } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { usePromos } from "../context/PromoContext";
import { useSettings } from "../context/SettingsContext";
import { useAudit } from "../context/AuditContext";
import gsap from "gsap";
import { BRAND } from "../lib/brand";
import {
  ArrowBigLeftDash,
  Lock,
  ShoppingCart,
  CreditCard,
  Banknote,
  User,
  Phone,
  MapPin,
  FileText,
  Tag,
  Package,
  Upload,
  Clock,
  AlertCircle,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Delivery", desc: "Address" },
  { id: 2, title: "Promotion", desc: "Coupon" },
  { id: 3, title: "Payment", desc: "KPay / COD" },
  { id: 4, title: "Review", desc: "Confirm" },
];

export function Checkout() {
  const { items, total: subtotal, count, clearCart } = useCart();
  const { user, openAuth } = useAuth();
  const { createOrder } = useOrders();
  const { promos, validatePromo, incrementUsage } = usePromos();
  const { settings, isStoreOpenNow } = useSettings();
  const { addLog } = useAudit();
  const navigate = useNavigate();
  const storeStatus = isStoreOpenNow();
  const [step, setStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);
  const [animatingDir, setAnimatingDir] = useState<"forward" | "backward">(
    "forward",
  );
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [payment, setPayment] = useState<"kpay" | "cod">("kpay");
  const [kpayPaid, setKpayPaid] = useState(false);
  const [kpayScreenshot, setKpayScreenshot] = useState<string | null>(null);
  const [kpayShotError, setKpayShotError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [custErrors, setCustErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [countdown, setCountdown] = useState(5);
  const successRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({ ...prev, name: prev.name || user.name }));
    }
  }, [user]);

  const promoValidation = applied
    ? validatePromo(applied, subtotal)
    : { ok: false, discount: 0 };
  const discount = promoValidation.ok ? promoValidation.discount : 0;
  const isFreeship =
    promoValidation.ok && promoValidation.promo?.type === "freeship";
  const delivery = settings.deliveryFee;
  const deliveryAfterPromo = isFreeship ? 0 : delivery;
  const grandTotal = Math.max(
    0,
    subtotal - (isFreeship ? 0 : discount) + deliveryAfterPromo,
  );

  const handleApply = () => {
    const code = promo.trim().toUpperCase();
    if (!code) {
      setPromoMsg("Please enter a promo code");
      return;
    }
    const res = validatePromo(code, subtotal);
    if (!res.ok) {
      setPromoMsg(res.msg || "Invalid promo code");
      setApplied(null);
      return;
    }
    setApplied(code);
    setPromoMsg(
      `Applied ${code} — ${res.promo?.label} (−${formatMMK(res.discount)})`,
    );
  };
  const handleRemovePromo = () => {
    setApplied(null);
    setPromo("");
    setPromoMsg(null);
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = "Full name is required";
    else if (customer.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!customer.phone.trim()) errs.phone = "Phone number is required";
    else if (
      !/^(\+?95\s?9\d{7,10}|09\d{7,9})$/.test(
        customer.phone.replace(/[\s-]/g, ""),
      )
    )
      errs.phone = "Invalid phone (use 09xxxxxxxx or +95 9xxxxxxxx)";
    if (!customer.address.trim()) errs.address = "Delivery address is required";
    else if (customer.address.trim().length < 5)
      errs.address = "Address too short (min 10 characters)";
    setCustErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const validateStep3 = () => {
    if (payment === "kpay") {
      if (!kpayScreenshot) {
        setKpayShotError("Please upload KPay payment screenshot");
        return false;
      }
      if (!kpayPaid) {
        setPromoMsg("Please tick 'I have completed KPay payment'");
        return false;
      }
    }
    setKpayShotError(null);
    return true;
  };

  const handleShot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setKpayShotError("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setKpayShotError("Image too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setKpayScreenshot(reader.result as string);
      setKpayShotError(null);
    };
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    if (stepLoading) return;
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    const next = Math.min(4, step + 1);
    if (next === step) return;
    setStepLoading(true);
    setAnimatingIdx(step - 1);
    setAnimatingDir("forward");
    setTimeout(() => {
      setStepLoading(false);
      setAnimatingIdx(null);
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };
  const goPrev = () => {
    if (stepLoading) return;
    const prev = Math.max(1, step - 1);
    if (prev === step) return;
    setStepLoading(true);
    setAnimatingIdx(prev - 1);
    setAnimatingDir("backward");
    setTimeout(() => {
      setStepLoading(false);
      setAnimatingIdx(null);
      setStep(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  const handleOrder = () => {
    if (!user) {
      openAuth("login", "Please login to place order");
      return;
    }
    if (!storeStatus.open) {
      setPromoMsg(`Store closed — ${storeStatus.reason}`);
      return;
    }
    if (!validateStep1() || !validateStep3()) {
      setStep(1);
      return;
    }
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const order = createOrder({
        userId: user.id,
        items: [...items],
        subtotal,
        discount: isFreeship ? 0 : discount,
        delivery: deliveryAfterPromo,
        total: grandTotal,
        promo: applied,
        payment,
        kpayScreenshot: payment === "kpay" ? kpayScreenshot : null,
        customer: { ...customer },
      });
      if (applied) incrementUsage(applied);
      addLog(
        "create",
        "order",
        order.id,
        `Order ${order.id} by ${customer.name} • ${formatMMK(grandTotal)}`,
        user.name,
        user.email,
      );
      // decrement stock simulation - not mandatory but log
      setOrderId(order.id);
      setLoading(false);
      setOrderSuccess(true);
      setCountdown(5);
    }, 2000);
  };

  useEffect(() => {
    if (!orderSuccess) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          clearCart();
          navigate("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orderSuccess, clearCart, navigate]);

  useEffect(() => {
    if (loading && loadingRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".loading-ring", {
          rotation: 360,
          duration: 0.9,
          repeat: -1,
          ease: "linear",
        });
        gsap.fromTo(
          ".loading-dot",
          { scale: 0.8, opacity: 0.6 },
          {
            scale: 1.2,
            opacity: 1,
            duration: 0.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.15,
          },
        );
      }, loadingRef);
      return () => ctx.revert();
    }
  }, [loading]);

  useEffect(() => {
    if (!orderSuccess || !successRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".success-check",
        { scale: 0, rotation: -90 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" },
      );
      gsap.fromTo(
        ".success-circle",
        { strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" },
      );
      for (let i = 0; i < 18; i++) {
        const conf = document.createElement("div");
        conf.style.position = "absolute";
        conf.style.left = "50%";
        conf.style.top = "20%";
        conf.style.width = "8px";
        conf.style.height = "8px";
        conf.style.background = [
          "#C1272E",
          "#FFF0E6",
          "#1A1E1D",
          "#6B7280",
          "#FFD8B8",
        ][i % 5];
        conf.style.borderRadius = i % 2 === 0 ? "50%" : "2px";
        conf.style.pointerEvents = "none";
        successRef.current?.appendChild(conf);
        gsap.to(conf, {
          x: (Math.random() - 0.5) * 320,
          y: Math.random() * 200 + 80,
          rotation: Math.random() * 720,
          opacity: 0,
          duration: 1.2 + Math.random() * 0.5,
          ease: "power2.out",
          delay: Math.random() * 0.2,
          onComplete: () => conf.remove(),
        });
      }
      gsap.from(".success-text", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        delay: 0.3,
      });
    }, successRef);
    return () => ctx.revert();
  }, [orderSuccess]);

  if (!user && !orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-dark/5 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary text-white flex items-center justify-center">
            <Lock size={24} className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-poppins font-bold text-dark text-xl mt-4">
            Login Required
          </h2>
          <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">
            Please login or signup to checkout. Your cart will be saved.
          </p>
          <button
            onClick={() => openAuth("login", "Please login to checkout")}
            className="mt-6 w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover"
          >
            Login / Signup
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-4 font-poppins text-muted text-sm hover:text-dark"
          >
            <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-dark/5 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
            <ShoppingCart size={24} className="w-6 h-6 text-muted" />
          </div>
          <h2 className="font-poppins font-bold text-dark text-xl mt-4">
            Cart is empty
          </h2>
          <p className="font-poppins text-muted text-sm mt-2 leading-[1.75]">
            Add some delicious dishes before checkout
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-6 bg-primary text-white font-poppins font-semibold px-6 py-3 rounded-full hover:bg-primary-hover"
          >
            <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-dark/5">
        <div className="max-w-[1160px] mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img
              src="/borcelle-logo.svg"
              alt={BRAND.fullName}
              className="h-10 md:h-11 w-auto object-contain"
            />
          </Link>
          <Link
            to="/"
            className="font-poppins font-semibold text-dark text-sm hover:text-primary flex items-center gap-1.5"
          >
            <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      {/* Stepper - single continuous line */}
      <div className="max-w-[1160px] mx-auto px-4 md:px-8 pt-4 md:pt-6 overflow-hidden">
        <div className="bg-white rounded-2xl border border-dark/5 p-3 md:p-4 flex items-start justify-between gap-2 md:gap-3 overflow-x-auto no-scrollbar relative">
          {/* single progress track */}
          <div className="hidden md:block absolute top-[34px] left-[12%] right-[12%] h-[2px] bg-dark/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${animatingIdx !== null ? (((animatingDir === "forward" ? step + 1 : step - 1) - 1) / (STEPS.length - 1)) * 100 : ((step - 1) / (STEPS.length - 1)) * 100}%`,
                transition:
                  animatingIdx !== null
                    ? "width 1.5s linear"
                    : "width 0.3s ease",
              }}
            />
          </div>
          <div className="md:hidden absolute top-[28px] left-[14%] right-[14%] h-[2px] bg-dark/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${animatingIdx !== null ? (((animatingDir === "forward" ? step + 1 : step - 1) - 1) / (STEPS.length - 1)) * 100 : ((step - 1) / (STEPS.length - 1)) * 100}%`,
                transition:
                  animatingIdx !== null
                    ? "width 1.5s linear"
                    : "width 0.3s ease",
              }}
            />
          </div>
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-center gap-1.5 flex-1 min-w-[60px] relative z-10"
            >
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-poppins font-bold shrink-0 border-2 transition-all ${step >= s.id ? "bg-primary text-white border-primary shadow-sm" : step === s.id - 1 && stepLoading ? "border-primary/50 bg-primary/10 text-primary" : "bg-background text-muted border-dark/10"}`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <p
                className={`font-poppins font-bold text-[11px] md:text-xs text-center leading-tight ${step >= s.id ? "text-dark" : step === s.id ? "text-primary" : "text-muted"}`}
              >
                {s.title}
              </p>
              <p
                className={`font-poppins text-[10px] md:text-[11px] text-center leading-tight ${step === s.id ? "text-primary font-medium" : "text-muted"}`}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-poppins font-semibold text-dark text-sm">
            Step {step} of 4 — {STEPS[step - 1].title}
          </p>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 md:px-8 py-4 md:py-8 grid lg:grid-cols-[1.35fr_0.85fr] gap-5 md:gap-8 overflow-hidden">
        <div className="space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark text-[16px] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-xs">
                  1
                </span>{" "}
                Delivery Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="font-poppins font-medium text-dark text-[13px]">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    placeholder="Aung Aung"
                    className={`mt-1.5 w-full px-3.5 py-3 rounded-xl border bg-background text-sm font-poppins outline-none ${custErrors.name ? "border-red-400" : "border-dark/10 focus:border-primary/40"}`}
                  />
                  {custErrors.name && (
                    <p className="font-poppins text-red-500 text-xs mt-1.5">
                      {custErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-poppins font-medium text-dark text-[13px]">
                    Phone <span className="text-primary">*</span>
                  </label>
                  <input
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="09 123 456 789"
                    className={`mt-1.5 w-full px-3.5 py-3 rounded-xl border bg-background text-sm font-poppins outline-none ${custErrors.phone ? "border-red-400" : "border-dark/10 focus:border-primary/40"}`}
                  />
                  {custErrors.phone && (
                    <p className="font-poppins text-red-500 text-xs mt-1.5">
                      {custErrors.phone}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="font-poppins font-medium text-dark text-[13px]">
                    Address <span className="text-primary">*</span>
                  </label>
                  <input
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    placeholder="No.123, Anawrahta Road, Yangon"
                    className={`mt-1.5 w-full px-3.5 py-3 rounded-xl border bg-background text-sm font-poppins outline-none ${custErrors.address ? "border-red-400" : "border-dark/10 focus:border-primary/40"}`}
                  />
                  {custErrors.address && (
                    <p className="font-poppins text-red-500 text-xs mt-1.5">
                      {custErrors.address}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="font-poppins font-medium text-dark text-[13px]">
                    Note (optional)
                  </label>
                  <input
                    value={customer.note}
                    onChange={(e) =>
                      setCustomer({ ...customer, note: e.target.value })
                    }
                    placeholder="Leave at door, no chili..."
                    className="mt-1.5 w-full px-3.5 py-3 rounded-xl border border-dark/10 bg-background text-sm font-poppins outline-none focus:border-primary/40"
                  />
                </div>
              </div>
              <button
                onClick={goNext}
                disabled={stepLoading}
                className={`w-full mt-6 font-poppins font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 min-h-[48px] ${stepLoading ? "bg-dark/60 text-white cursor-wait" : "bg-primary text-white hover:bg-primary-hover shadow-md"}`}
              >
                {stepLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Loading...
                  </>
                ) : (
                  "Next"
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark text-[16px] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-xs">
                  2
                </span>{" "}
                Promotion Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="TRY ZEN10, ZEN20, WELCOME5K"
                  className="flex-1 min-w-0 px-4 py-3 rounded-full border-2 border-dark/10 bg-background font-poppins font-medium text-sm tracking-wide outline-none focus:border-primary/30 uppercase placeholder:normal-case"
                />
                {applied ? (
                  <button
                    onClick={handleRemovePromo}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-dark text-white font-poppins font-semibold text-sm min-h-[44px]"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary text-white font-poppins font-semibold text-sm shadow-md min-h-[44px]"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoMsg && (
                <p
                  className={`font-poppins text-sm mt-3 px-4 py-2.5 rounded-xl ${applied ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                >
                  {applied ? "✓ " : "• "}
                  {promoMsg}
                </p>
              )}
              {applied && discount > 0 && promoValidation.promo && (
                <div className="mt-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 flex justify-between">
                  <span className="font-poppins font-medium text-dark text-sm">
                    {promoValidation.promo.label}
                  </span>
                  <span className="font-poppins font-bold text-primary">
                    −{formatMMK(discount)}
                  </span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {promos
                  .filter((p) => p.isActive)
                  .slice(0, 8)
                  .map((p) => {
                    const v = validatePromo(p.code, subtotal);
                    return (
                      <button
                        key={p.code}
                        onClick={() => {
                          if (!v.ok) {
                            setPromoMsg(v.msg || "Invalid");
                            setApplied(null);
                            return;
                          }
                          setPromo(p.code);
                          setApplied(p.code);
                          setPromoMsg(
                            `Applied ${p.code} — ${p.label} (−${formatMMK(v.discount)})`,
                          );
                        }}
                        className={`px-3.5 py-2 rounded-full text-xs font-poppins font-semibold border ${applied === p.code ? "bg-primary text-white border-primary" : "bg-surface text-dark border-dark/5 hover:border-dark/20"}`}
                      >
                        {p.code} • {p.label}
                      </button>
                    );
                  })}
              </div>
              {!storeStatus.open && (
                <p className="font-poppins text-red-600 text-xs mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Store closed — {storeStatus.reason}
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={goPrev}
                  disabled={stepLoading}
                  className="flex-1 bg-white border-2 border-dark/10 font-poppins font-semibold py-3.5 rounded-full min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={goNext}
                  disabled={stepLoading}
                  className={`flex-1 font-poppins font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 min-h-[48px] ${stepLoading ? "bg-dark/60 text-white" : "bg-primary text-white hover:bg-primary-hover shadow-md"}`}
                >
                  {stepLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Loading...
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark text-[16px] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-xs">
                  3
                </span>{" "}
                Payment Method
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => setPayment("kpay")}
                  className={`p-4 rounded-2xl border-2 text-left flex gap-3 ${payment === "kpay" ? "border-primary bg-primary/5 shadow-sm" : "border-dark/10 hover:border-dark/20 bg-background"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment === "kpay" ? "bg-primary text-white" : "bg-white border border-dark/10"}`}
                  >
                    <CreditCard
                      size={18}
                      className={
                        payment === "kpay" ? "text-white" : "text-dark"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-dark text-sm">
                      KPay (QR)
                    </p>
                    <p className="font-poppins text-muted text-xs leading-[1.6]">
                      Scan QR to pay instantly
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${payment === "kpay" ? "border-primary bg-primary" : "border-dark/20"}`}
                  >
                    {payment === "kpay" && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setPayment("cod")}
                  className={`p-4 rounded-2xl border-2 text-left flex gap-3 ${payment === "cod" ? "border-primary bg-primary/5 shadow-sm" : "border-dark/10 hover:border-dark/20 bg-background"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment === "cod" ? "bg-primary text-white" : "bg-white border border-dark/10"}`}
                  >
                    <Banknote
                      size={18}
                      className={payment === "cod" ? "text-white" : "text-dark"}
                    />
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-dark text-sm">
                      Cash on Delivery
                    </p>
                    <p className="font-poppins text-muted text-xs leading-[1.6]">
                      Pay when food arrives
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${payment === "cod" ? "border-primary bg-primary" : "border-dark/20"}`}
                  >
                    {payment === "cod" && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              </div>
              {payment === "kpay" && (
                <div className="mt-5 bg-background rounded-2xl p-5 border border-dark/5 flex flex-col items-center">
                  <p className="font-poppins font-semibold text-dark text-sm">
                    Scan to Pay with KPay
                  </p>
                  <p className="font-poppins text-muted text-xs mt-1">
                    Amount:{" "}
                    <span className="font-bold text-primary">
                      {formatMMK(grandTotal)}
                    </span>
                  </p>
                  <div className="mt-4 bg-white p-3 rounded-2xl shadow-sm border border-dark/5">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KPay_SeoulteiZen_${grandTotal}_${applied || "NOCODE"}`}
                      alt="KPay QR"
                      className="w-[160px] h-[160px] md:w-[180px] md:h-[180px]"
                    />
                  </div>
                  <p className="font-poppins text-muted text-[11px] mt-3 text-center leading-[1.6]">
                    KPay App → Scan → Confirm
                  </p>
                  <div className="w-full mt-5">
                    <label className="font-poppins font-semibold text-dark text-sm flex items-center gap-1.5">
                      Upload KPay Screenshot{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <p className="font-poppins text-muted text-xs mt-1">
                      After payment, upload screenshot (JPG/PNG, max 5MB)
                    </p>
                    <label
                      className={`mt-3 flex flex-col items-center justify-center w-full py-6 px-4 rounded-2xl border-2 border-dashed cursor-pointer ${kpayScreenshot ? "border-green-400 bg-green-50" : "border-primary/30 bg-white hover:bg-primary/5"}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleShot}
                        className="hidden"
                      />
                      {kpayScreenshot ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={kpayScreenshot}
                            alt="KPay proof"
                            className="w-full max-w-[220px] max-h-[220px] object-contain rounded-xl border border-dark/10 shadow-sm"
                          />
                          <span className="font-poppins font-semibold text-green-700 text-xs bg-green-100 px-3 py-1.5 rounded-full">
                            ✓ Uploaded — tap to change
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setKpayScreenshot(null);
                            }}
                            className="font-poppins text-red-500 text-xs underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Upload size={20} className="w-5 h-5" />
                          </div>
                          <span className="font-poppins font-semibold text-dark text-sm mt-3">
                            Tap to upload screenshot
                          </span>
                          <span className="font-poppins text-muted text-xs mt-1">
                            JPG, PNG — max 5MB
                          </span>
                        </>
                      )}
                    </label>
                    {kpayShotError && (
                      <p className="font-poppins text-red-500 text-xs mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {kpayShotError}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 mt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kpayPaid}
                      onChange={(e) => setKpayPaid(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="font-poppins font-medium text-dark text-sm">
                      I have completed KPay payment{" "}
                      <span className="text-primary">*</span>
                    </span>
                  </label>
                </div>
              )}
              {payment === "cod" && (
                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="font-poppins font-medium text-amber-800 text-sm flex items-center gap-1.5">
                    <FileText size={14} className="w-3.5 h-3.5 shrink-0" />{" "}
                    Please prepare exact amount:{" "}
                    <span className="font-bold">{formatMMK(grandTotal)}</span> —
                    rider will collect on delivery.
                  </p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={goPrev}
                  disabled={stepLoading}
                  className="flex-1 bg-white border-2 border-dark/10 font-poppins font-semibold py-3.5 rounded-full min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={goNext}
                  disabled={stepLoading}
                  className={`flex-1 font-poppins font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 min-h-[48px] ${stepLoading ? "bg-dark/60 text-white" : "bg-primary text-white hover:bg-primary-hover shadow-md"}`}
                >
                  {stepLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Loading...
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-2xl border border-dark/5 p-4 md:p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-dark text-[16px] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-xs">
                  4
                </span>{" "}
                Review & Confirm
              </h3>
              <div className="mt-4 space-y-3 bg-background rounded-2xl p-4 border border-dark/5">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-dark text-white text-[11px] font-poppins font-semibold">
                    Delivery
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-dark flex items-center gap-1">
                    <User size={11} className="w-[11px] h-[11px]" />{" "}
                    {customer.name}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-dark flex items-center gap-1">
                    <Phone size={11} className="w-[11px] h-[11px]" />{" "}
                    {customer.phone}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins text-muted flex items-center gap-1">
                    <MapPin size={11} className="w-[11px] h-[11px]" />
                    <span className="text-dark">{customer.address}</span>
                  </span>
                  {customer.note && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-poppins text-amber-700 flex items-center gap-1">
                      <FileText size={11} className="w-[11px] h-[11px]" />{" "}
                      {customer.note}
                    </span>
                  )}
                </div>
                <div className="h-px bg-dark/5" />
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-poppins font-semibold border flex items-center gap-1 ${payment === "kpay" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                  >
                    {payment === "kpay" ? (
                      <>
                        <CreditCard size={11} className="w-[11px] h-[11px]" />{" "}
                        KPay
                      </>
                    ) : (
                      <>
                        <Banknote size={11} className="w-[11px] h-[11px]" />{" "}
                        Cash On Delivery
                      </>
                    )}
                  </span>
                  {applied && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-poppins font-bold flex items-center gap-1">
                      <Tag size={11} className="w-[11px] h-[11px]" /> {applied}{" "}
                      −{formatMMK(discount)}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-poppins font-bold shadow-sm flex items-center gap-1">
                    <Package size={11} className="w-[11px] h-[11px]" />{" "}
                    {formatMMK(grandTotal)} • {items.length} items
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={goPrev}
                  disabled={stepLoading}
                  className="flex-1 bg-white border-2 border-dark/10 font-poppins font-semibold py-3.5 rounded-full min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleOrder}
                  disabled={loading || stepLoading}
                  className={`flex-1 font-poppins font-bold text-[15px] py-4 rounded-full shadow-lg flex items-center justify-center gap-2 ${loading ? "bg-dark/60 text-white cursor-wait" : "bg-primary text-white hover:bg-primary-hover hover:shadow-xl active:scale-[0.98]"}`}
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    `Confirm Order `
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right summary - always visible - enhanced with badges */}
        <div className="lg:sticky lg:top-[80px] h-fit space-y-6">
          <div className="bg-white rounded-2xl border border-dark/5 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-dark/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-poppins font-bold text-dark text-[16px]">
                    Order Summary
                  </h3>
                  <p className="font-poppins text-muted text-xs mt-1">
                    {items.length} {items.length === 1 ? "dish" : "dishes"} •
                    Delivery 30-45 min
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-dark text-white text-[11px] font-poppins font-bold shadow-sm flex items-center gap-1">
                  <Package size={11} className="w-[11px] h-[11px]" /> {count}{" "}
                  pcs
                </span>
              </div>
              {/* badges strip */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-surface border border-dark/5 text-[11px] font-poppins font-semibold text-dark flex items-center gap-1">
                  <Package size={11} className="w-[11px] h-[11px]" />{" "}
                  {items.length} dishes
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-dark flex items-center gap-1">
                  <Clock size={11} className="w-[11px] h-[11px]" /> 30-45 min
                </span>
                {applied && (
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-poppins font-bold flex items-center gap-1">
                    <Tag size={11} className="w-[11px] h-[11px]" /> {applied}
                  </span>
                )}
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-poppins font-semibold border flex items-center gap-1 ${payment === "kpay" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                >
                  {payment === "kpay" ? (
                    <>
                      <CreditCard size={11} className="w-[11px] h-[11px]" />{" "}
                      KPay
                    </>
                  ) : (
                    <>
                      <Banknote size={11} className="w-[11px] h-[11px]" /> Cash
                      On Delivery
                    </>
                  )}
                </span>
                {deliveryAfterPromo === 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-poppins font-bold flex items-center gap-1">
                    Free Delivery
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-3 bg-background/40 rounded-xl p-2 border border-dark/5 hover:bg-background transition-colors"
                >
                  <div className="relative shrink-0">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-14 h-14 rounded-xl object-cover border border-dark/5"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-dark text-white text-[10px] font-poppins font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      ×{it.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-semibold text-dark text-[13px] leading-[1.3] line-clamp-1">
                      {it.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-medium text-muted">
                        Qty {it.qty} × {formatMMK(it.price)}
                      </span>
                      {it.qty > 1 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-poppins font-bold">
                          {formatMMK(it.price * it.qty)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-poppins font-bold text-dark text-sm">
                      {formatMMK(it.price * it.qty)}
                    </p>
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-surface border border-dark/5 text-[10px] font-poppins font-semibold text-dark">
                      dish
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 md:p-6 bg-background/60 space-y-3 border-t border-dark/5">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-white border border-dark/5 text-[11px] font-poppins font-semibold text-dark flex items-center gap-1">
                  <Package size={11} className="w-[11px] h-[11px]" /> Subtotal
                </span>
                {discount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-poppins font-bold flex items-center gap-1">
                    <Tag size={11} className="w-[11px] h-[11px]" /> -
                    {formatMMK(discount)}
                  </span>
                )}
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-poppins font-bold border flex items-center gap-1 ${deliveryAfterPromo === 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-white border-dark/5 text-dark"}`}
                >
                  {deliveryAfterPromo === 0
                    ? "FREE"
                    : formatMMK(deliveryAfterPromo)}
                </span>
              </div>
              <div className="flex justify-between font-poppins text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold text-dark">
                  {formatMMK(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-poppins text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1">
                    <Tag size={12} className="w-3 h-3" /> Discount{" "}
                    {applied && `(${applied})`}
                  </span>
                  <span className="font-bold text-green-700">
                    −{formatMMK(applied === "FREESHIP" ? 0 : discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-poppins text-sm">
                <span className="text-muted flex items-center gap-1">
                  <Package size={12} className="w-3 h-3" /> Delivery
                </span>
                <span
                  className={
                    deliveryAfterPromo === 0
                      ? "font-bold text-green-700"
                      : "font-semibold text-dark"
                  }
                >
                  {deliveryAfterPromo === 0
                    ? "FREE"
                    : formatMMK(deliveryAfterPromo)}
                </span>
              </div>
              <div className="flex justify-between font-poppins text-[18px] border-t border-dark/10 pt-3">
                <span className="font-bold text-dark flex items-center gap-1.5">
                  <Package size={14} className="w-3.5 h-3.5" /> Total
                </span>
                <span className="font-bold text-primary">
                  {formatMMK(grandTotal)}
                </span>
              </div>
              {discount > 0 && (
                <p className="font-poppins text-green-700 text-xs bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-center flex items-center justify-center gap-1">
                  <Tag size={12} className="w-3 h-3" /> You saved{" "}
                  {formatMMK(discount)} with {applied}!
                </p>
              )}
              {!discount && (
                <p className="font-poppins text-muted text-[11px] text-center">
                  Add promo code to save • Delivery 30-45 min
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div
          ref={loadingRef}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-[360px] w-full p-7 text-center shadow-xl border border-dark/5">
            {/* Simple noodle bowl — kept, rest is minimal */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
                <span
                  className="w-0.5 h-5 bg-primary/25 rounded-full animate-[steam_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="w-0.5 h-6 bg-primary/25 rounded-full animate-[steam_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-primary rounded-b-[40px] border border-primary/20 shadow-sm" />
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-1">
                <span
                  className="w-1.5 h-7 bg-[#FFE7A8] rounded-full animate-[noodle_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="w-1.5 h-9 bg-[#FFD23F] rounded-full animate-[noodle_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.14s" }}
                />
                <span
                  className="w-1.5 h-7 bg-[#FFE7A8] rounded-full animate-[noodle_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.28s" }}
                />
              </div>
              <div
                className="absolute bottom-[34px] left-1/2 -translate-x-1/2 w-14 h-0.5 bg-dark rounded-full rotate-[-12deg] animate-[chop_1s_ease-in-out_infinite]"
                style={{ transformOrigin: "right center" }}
              />
              <div
                className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-14 h-0.5 bg-dark rounded-full rotate-[-7deg] animate-[chop_1s_ease-in-out_infinite_0.12s]"
                style={{ transformOrigin: "right center" }}
              />
            </div>
            <h3 className="font-poppins font-semibold text-dark text-[16px] mt-5">
              Preparing your bowl...
            </h3>
            <p className="font-poppins text-muted text-xs mt-1">
              {BRAND.name} • Fresh noodles on the way
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 bg-background rounded-full px-4 py-2 border border-dark/5">
              <span className="text-[11px] font-poppins font-bold tracking-widest text-primary">
                7-LEVELS
              </span>
              <span className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                    style={{
                      animationDelay: `${i * 0.08}s`,
                      opacity: 0.35 + i * 0.09,
                    }}
                  />
                ))}
              </span>
              <span className="text-[11px] font-poppins font-bold tracking-widest text-dark">
                SPICY
              </span>
            </div>
            <p className="font-poppins text-primary text-xs mt-4 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              {payment === "kpay"
                ? "Verifying KPay..."
                : "Packing your order..."}
            </p>
            <style>{`@keyframes steam{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-5px);opacity:0}} @keyframes noodle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}} @keyframes chop{0%,100%{transform:translateX(-50%) rotate(-12deg)}50%{transform:translateX(-50%) rotate(-10deg) translateY(-1px)}}`}</style>
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={successRef}
            className="relative bg-white rounded-3xl max-w-[480px] w-full p-8 text-center overflow-hidden shadow-2xl"
          >
            <div className="success-check w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center">
              <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
                <circle
                  className="success-circle"
                  cx="26"
                  cy="26"
                  r="22"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="200"
                />
                <path
                  d="M14 27 L22 35 L38 18"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="success-text font-poppins font-bold text-dark text-[22px] mt-5">
              Order Confirmed!
            </h2>
            <p className="success-text font-poppins text-muted text-sm mt-2 leading-[1.75]">
              Thank you — your Korean fire bowl is being fired up with care.
            </p>
            <div className="success-text bg-background rounded-2xl p-4 mt-5 border border-dark/5">
              <p className="font-poppins font-bold text-dark text-sm">
                Order ID
              </p>
              <p className="font-poppins font-bold text-primary text-xl tracking-wide">
                {orderId}
              </p>
              <p className="font-poppins text-muted text-xs mt-2">
                {payment === "kpay" ? "KPay • Paid" : "Cash on Delivery"} •{" "}
                {formatMMK(grandTotal)}
              </p>
              <p className="font-poppins text-muted text-xs">
                ETA 30-45 min • Rider will call you
              </p>
            </div>
            <p className="success-text font-poppins text-muted text-xs mt-4">
              Redirecting to home in {countdown} second
              {countdown !== 1 ? "s" : ""}...
            </p>
            <div className="success-text flex gap-3 mt-4">
              <button
                onClick={() => {
                  clearCart();
                  navigate("/");
                }}
                className="flex-1 bg-dark text-white font-poppins font-semibold py-3 rounded-full hover:bg-dark/90 flex items-center justify-center gap-1.5"
              >
                <ArrowBigLeftDash size={16} className="w-4 h-4" /> Back to Home
                Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}