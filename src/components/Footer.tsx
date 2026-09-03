import { BRAND } from "../lib/brand";
import { Flame } from "lucide-react";

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 70,
        behavior: "smooth",
      });
  };

  return (
    <footer id="contact" className="bg-dark text-white">
      <div className="max-w-[1160px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-8 md:gap-6">
          <div>
            <p className="font-inria text-white/80 text-[14px] leading-[1.75] max-w-[300px]">
              {BRAND.description}
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.6"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="white"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M19.07 4.93A10 10 0 005.06 19.07L4 22l3.07-1.06A10 10 0 1019.07 4.93zM12 20a8 8 0 01-4.07-1.11l-.29-.17-1.83.63.61-1.78-.19-.31A8 8 0 1112 20zm4.37-5.88c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.39-.4-.54-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="font-bayon text-primary text-[12px] tracking-[0.1em]">
              VISIT US
            </p>
            <p className="font-inria text-white/80 text-[13px] leading-[1.75] mt-2">
              Junction Square - Level 2<br />
              Yangon City , Myanmar
            </p>
            <a
              href="tel:+959459038758"
              className="font-inria text-white/80 text-[13px] mt-2 block hover:text-white"
            >
              09459038758
            </a>
          </div>

          <div>
            <p className="font-bayon text-primary text-[12px] tracking-[0.1em]">
              HOURS
            </p>
            <p className="font-inria text-white/80 text-[13px] leading-[1.75] mt-2">
              Lunch: 12PM – 3PM
              <br />
              Dinner: 6PM – 11PM
            </p>
            <p className="font-inria text-white/80 text-[13px] mt-2">
              Closed Mondays
            </p>
          </div>

          <div>
            <p className="font-bayon text-primary text-[12px] tracking-[0.1em]">
              LINKS
            </p>
            <nav className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => scrollTo("home")}
                className="font-inria text-white/80 text-[13px] text-left hover:text-white py-1 min-h-[28px]"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo("about")}
                className="font-inria text-white/80 text-[13px] text-left hover:text-white py-1 min-h-[28px]"
              >
                About
              </button>
              <button
                onClick={() => scrollTo("gallery")}
                className="font-inria text-white/80 text-[13px] text-left hover:text-white py-1 min-h-[28px]"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollTo("reservation")}
                className="font-inria text-white/80 text-[13px] text-left hover:text-white py-1 min-h-[28px]"
              >
                Reservation
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-8 md:mt-10 border-t border-white/[0.07] pt-7 md:pt-8">
          <div className="flex flex-col items-center text-center px-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-px w-10 sm:w-16 md:w-24 bg-white/10" />
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
                <Flame size={16} className="fill-white text-white" />
              </span>
              <div className="h-px w-10 sm:w-16 md:w-24 bg-white/10" />
            </div>
            <h3 className="font-korosu font-black text-white tracking-tight leading-none mt-4 text-[28px] sm:text-[36px] md:text-[42px]">
              BORCELLE
            </h3>
            <p className="font-poppins font-medium text-white/35 text-[10px] sm:text-xs tracking-[0.22em] mt-2">
              {BRAND.tagline} · {BRAND.shortTagline} · YANGON
            </p>
            <p className="font-poppins text-white/45 text-[12px] sm:text-[13px] leading-[1.7] max-w-[520px] mt-3">
              Fire in every bowl. From silky Lv.1 to volcanic Lv.7 — one soul,
              seven heats. Pull up a chair at Borcelle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-poppins font-semibold">
                500+ Daily Guests
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-poppins font-semibold">
                50+ Dishes
              </span>
              <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-poppins font-bold">
                4.9★ Rated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom food image */}
      <div className="relative h-[260px] md:h-[320px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1440&h=500&fit=crop"
          alt="Korean dishes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-transparent h-24" />
      </div>

      <div className="bg-dark border-t border-white/10 py-6">
        <div className="max-w-[1160px] mx-auto px-4 md:px-8 flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-4">
          <p className="font-poppins font-medium text-white/60 text-[12px] md:text-[13px] tracking-wide text-center">
            © 2026 {BRAND.fullName}. All rights reserved. Crafted with
            tradition.
          </p>
          <p className="font-poppins font-medium text-white/60 text-[12px] md:text-[13px] tracking-wide text-center">
            Developed by Thura.
          </p>
        </div>
      </div>
    </footer>
  );
}
