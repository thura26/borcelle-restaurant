import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Ticker } from "./components/Ticker";
import { SoulGallery } from "./components/SoulGallery";
import { CuisineGrid } from "./components/CuisineGrid";
import { JourneyBanner } from "./components/JourneyBanner";
import { Testimonials } from "./components/Testimonials";
import { CraftedGallery } from "./components/CraftedGallery";
import { MenuList } from "./components/MenuList";
import { Chef } from "./components/Chef";
import { Reservation } from "./components/Reservation";
import { Footer } from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { ReservationProvider } from "./context/ReservationContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { MenuProvider } from "./context/MenuContext";
import { PromoProvider } from "./context/PromoContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider, ToastContainer } from "./context/ToastContext";
import { AuditProvider } from "./context/AuditContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Checkout } from "./pages/Checkout";
import { Account } from "./pages/Account";
import { AuthModal } from "./components/AuthModal";
import { RequireAdmin } from "./components/ProtectedRoute";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardOverview } from "./pages/admin/DashboardOverview";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminMenu } from "./pages/admin/AdminMenu";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminReservations } from "./pages/admin/AdminReservations";
import { AdminPromos } from "./pages/admin/AdminPromos";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminAudit } from "./pages/admin/AdminAudit";
import { AdminAccount } from "./pages/admin/AdminAccount";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function Home() {
  useEffect(() => {
    ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <SoulGallery />
        <CuisineGrid />
        <JourneyBanner />
        <Testimonials />
        <CraftedGallery />
        <Ticker />
        <MenuList />
        <Chef />
        <Reservation />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const { modalOpen, modalMode, modalMessage, closeAuth, user } = useAuth();
  const navigate = useNavigate();

  // redirect admin to dashboard after login via modal? handled in AuthModal but also here for direct login
  useEffect(() => {
    // do not auto-redirect on mount, only when user changes and on checkout/account?
  }, [user]);

  const handleCloseAuth = () => {
    closeAuth();
    if (user && user.role === "admin") {
      setTimeout(() => navigate("/admin"), 800);
    }
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="account" element={<AdminAccount />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center"><h1 className="font-poppins font-bold text-dark text-3xl">404 — Not Found</h1><p className="font-poppins text-muted mt-2">Page not found.</p><button onClick={() => navigate("/")} className="mt-6 bg-primary text-white font-poppins font-semibold px-6 py-3 rounded-full">Back Home</button></div>} />
      </Routes>
      <AuthModal open={modalOpen} onClose={handleCloseAuth} initialMode={modalMode} message={modalMessage || undefined} />
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuditProvider>
          <SettingsProvider>
            <AuthProvider>
              <ReservationProvider>
                <OrderProvider>
                  <ProductProvider>
                    <CategoryProvider>
                      <MenuProvider>
                        <PromoProvider>
                          <CartProvider>
                            <AppRoutes />
                          </CartProvider>
                        </PromoProvider>
                      </MenuProvider>
                    </CategoryProvider>
                  </ProductProvider>
                </OrderProvider>
              </ReservationProvider>
            </AuthProvider>
          </SettingsProvider>
        </AuditProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
