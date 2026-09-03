import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { soulGalleryImages } from "../lib/data";
gsap.registerPlugin(ScrollTrigger);

export function SoulGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".soul-heading", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: ".soul-heading", start: "top 85%" },
      });
      gsap.from(".soul-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        scrollTrigger: { trigger: ".soul-grid", start: "top 85%" },
      });
      gsap.from(".bento-card", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: ".bento-card", start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  // Mobile: start with 2nd card centered so left/right peek like design
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.innerWidth >= 768) return;
    // wait for layout
    requestAnimationFrame(() => {
      const second = grid.querySelector<HTMLElement>(".soul-card:nth-child(2)");
      if (second) {
        second.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
      }
    });
  }, []);

  const scrollToMenu = () => {
    const el = document.getElementById("menu");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };

  return (
    <section ref={ref} className="bg-background pt-12 md:pt-16 pb-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 text-center">
        <p className="font-bayon text-primary text-[12px] md:text-[13px] tracking-[0.14em]">7-LEVELS KOREAN SPICY NOODLE</p>
        <h2 className="soul-heading font-bayon text-dark text-[30px] md:text-[36px] leading-[1.08] mt-2">
          WHERE EVERY DISH
          <br />
          CARRIES A SOUL
          <span className="inline-block ml-1 text-primary text-[16px] align-super">✧</span>
        </h2>
        <button
          onClick={scrollToMenu}
          className="mt-5 font-poppins font-semibold text-[13px] md:text-[14px] tracking-[0.06em] bg-white text-dark px-7 py-3 min-h-[44px] rounded-full border-2 border-dark/10 hover:border-dark hover:shadow-md active:scale-[0.98] transition-all"
        >
          EXPLORE MENU
        </button>
      </div>

      {/* horizontal gallery - mobile: centered start, desktop: left aligned */}
      <div
        ref={gridRef}
        className="soul-grid mt-8 md:mt-10 flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[14vw] md:px-8 pb-2 scroll-px-[14vw] md:scroll-px-8"
      >
        {soulGalleryImages.map((img, i) => (
          <div
            key={i}
            className="soul-card shrink-0 snap-center w-[72vw] md:w-[280px] lg:w-[320px] aspect-[4/3] rounded-xl overflow-hidden bg-dark relative group cursor-pointer"
          >
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Red bento banner */}
      <div className="max-w-[1160px] mx-auto px-4 md:px-8 mt-8 md:mt-10">
        <div className="bento-card relative bg-primary rounded-xl overflow-hidden flex flex-col lg:flex-row min-h-[280px] md:min-h-[320px]">
          <div className="relative z-10 p-6 md:p-8 lg:p-10 lg:w-[42%] flex flex-col justify-center">
            <h3 className="font-bayon text-background text-[22px] md:text-[26px] leading-[1.08]">
              INSPIRED BY THE
              <br />
              ELEGANCE OF TRADITIONAL
              <br />
              KOREAN RYOTEI DINING,
            </h3>
            <p className="font-inria text-background/90 text-[14px] md:text-[15px] leading-[1.75] mt-4 max-w-[360px]">
              Borcelle was created as a place where food meets mindfulness. We focus on simplicity, seasonal ingredients, and the
              harmony of taste and presentation — delivering an experience that is both refined and memorable.
            </p>
          </div>

          <div className="relative lg:w-[58%] flex items-end justify-center lg:justify-end p-4 md:p-0">
            {/* sakura branch */}
            <svg className="absolute top-2 right-12 w-[180px] md:w-[220px] opacity-90 pointer-events-none" viewBox="0 0 220 120" fill="none">
              <path d="M0 60 Q60 20 110 50 T200 30" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <path d="M60 50 Q55 30 40 20 M80 45 Q85 25 90 15 M130 50 Q135 30 150 20 M160 42 Q170 25 185 18" stroke="black" strokeWidth="2" />
              {/* blossoms */}
              <g fill="white" stroke="black" strokeWidth="0.5">
                <circle cx="40" cy="18" r="6" /><circle cx="90" cy="13" r="5" /><circle cx="150" cy="18" r="6" /><circle cx="185" cy="16" r="5" />
                <circle cx="30" cy="35" r="4" /><circle cx="100" cy="28" r="4" /><circle cx="170" cy="30" r="4" />
              </g>
              <g fill="#FFB7C5">
                <circle cx="40" cy="18" r="2" /><circle cx="90" cy="13" r="1.8" /><circle cx="150" cy="18" r="2" />
              </g>
            </svg>

            <div className="relative flex gap-2 md:gap-3 items-end pb-4 md:pb-6 md:pr-6">
              <div className="w-[42vw] md:w-[300px] lg:w-[320px] aspect-[1.25] rounded-xl overflow-hidden shadow-xl rotate-[-4deg] translate-y-1 bg-dark">
                <img src="https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=500&fit=crop" alt="Bento" className="w-full h-full object-cover" />
              </div>
              <div className="w-[42vw] md:w-[300px] lg:w-[320px] aspect-[1.25] rounded-xl overflow-hidden shadow-xl rotate-[6deg] -ml-6 md:-ml-10 bg-dark">
                <img src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=500&fit=crop" alt="Sushi bento" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
