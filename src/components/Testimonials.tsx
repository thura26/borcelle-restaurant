import { useEffect, useRef, useState } from "react";
import { testimonials } from "../lib/data";
import gsap from "gsap";
import { Star } from "lucide-react";

export function Testimonials() {
  const [active, setActive] = useState(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setActive((p) => (p + 1) % testimonials.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".testi-card",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, overwrite: true },
    );
  }, [active]);

  // for mobile, show carousel single; for desktop show 3
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visible = isMobile ? [testimonials[active]] : testimonials;

  return (
    <section
      id="about"
      className="bg-background pt-12 md:pt-16 pb-10 relative overflow-hidden"
    >
      {/* ink mountain bg */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg
          viewBox="0 0 1440 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M0 400 L300 200 L500 300 L700 150 L900 250 L1100 100 L1440 200 L1440 600 L0 600 Z"
            fill="#171717"
          />
        </svg>
      </div>

      <div className="relative max-w-[1160px] mx-auto px-4 md:px-8 text-center">
        <p className="font-bayon text-primary text-[12px] md:text-[13px] tracking-[0.14em]">
          TESTIMONIAL
        </p>
        <h2 className="font-bayon text-dark text-[26px] md:text-[32px] leading-[1.1] tracking-tight mt-1">
          WHAT OUR CLIENTS SAY
        </h2>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mt-8">
          {visible.map((t, i) => (
            <div
              key={t.name}
              className="testi-card bg-surface rounded-xl p-6 md:p-7 pt-8 md:pt-7 relative flex flex-col items-center text-center"
            >
              <div className="w-[96px] h-[96px] md:w-[108px] md:h-[108px] rounded-full overflow-hidden -mt-1 md:mt-0 md:-mb-1 bg-dark shrink-0">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-1 mt-4 text-primary">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    className="w-[13px] h-[13px] fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="font-inria text-dark text-[13px] md:text-[14px] leading-[1.75] mt-3">
                {t.text}
              </p>
              <p className="font-bayon text-dark text-[12px] md:text-[13px] tracking-[0.08em] mt-4">
                {t.name}
              </p>
              {/* hide extra index for desktop stagger effect */}
              <span className="hidden">{i}</span>
            </div>
          ))}
        </div>

        {/* dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`transition-all rounded-full min-w-[12px] min-h-[12px] ${active === idx ? "w-6 h-3 bg-primary" : "w-3 h-3 bg-dark/15 hover:bg-dark/25"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
