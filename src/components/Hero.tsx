import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-label", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.from(".hero-title", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.4,
      });
      gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.8, delay: 0.6 });
      gsap.from(".hero-ctas", { y: 20, opacity: 0, duration: 0.8, delay: 0.8 });
      gsap.from(".hero-sushi", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.7,
      });

      gsap.to(".hero-pine", {
        yPercent: -15,
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".hero-mountain", {
        yPercent: -8,
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={ref}
      id="home"
      className="relative bg-background overflow-hidden pt-[64px] lg:pt-[76px] xl:pt-[84px] pb-0"
    >
      {/* ink wash background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left tree */}
        <div className="hero-pine absolute left-0 bottom-[28%] w-[28%] md:w-[22%] opacity-[0.08]">
          <svg viewBox="0 0 300 400" className="w-full">
            <path
              d="M150 20 L120 60 L140 60 L110 100 L135 100 L100 150 L130 150 L90 200 L120 200 L60 260 L180 260 L100 320 L220 320 L150 380 L150 340 L200 300 L130 300 L190 250 L120 250 L180 190 L110 190 L170 140 L110 140 L140 90 L120 90 Z"
              fill="#171717"
            />
            <ellipse
              cx="150"
              cy="390"
              rx="40"
              ry="8"
              fill="#171717"
              opacity="0.3"
            />
          </svg>
        </div>
        {/* Right pine + Fuji */}
        <div className="hero-mountain absolute right-0 bottom-[18%] w-[45%] md:w-[38%] opacity-[0.08]">
          <svg viewBox="0 0 500 450" className="w-full">
            {/* Fuji */}
            <path
              d="M200 350 L320 120 L440 350 Z"
              fill="#171717"
              opacity="0.15"
            />
            <path
              d="M280 180 L320 120 L360 180 L340 190 L320 150 L300 190 Z"
              fill="white"
            />
            {/* pine */}
            <g transform="translate(300,20)">
              <path
                d="M0 0 L-30 40 L-10 40 L-40 80 L-15 80 L-45 130 L-20 130 L-60 180 L-25 180 L-70 240 L70 240 L25 180 L60 180 L20 130 L45 130 L15 80 L40 80 L10 40 L30 40 Z"
                fill="#171717"
              />
            </g>
            <ellipse
              cx="320"
              cy="360"
              rx="120"
              ry="20"
              fill="#171717"
              opacity="0.1"
            />
          </svg>
        </div>

        {/* birds */}
        <div className="absolute left-[15%] top-[32%] flex gap-6 opacity-20">
          {[...Array(8)].map((_, i) => (
            <svg
              key={i}
              width="14"
              height="8"
              viewBox="0 0 14 8"
              className="fill-dark"
              style={{ transform: `translateY(${i * 3}px)` }}
            >
              <path d="M0 4 Q3 0 7 4 Q11 0 14 4 Q11 2 7 6 Q3 2 0 4" />
            </svg>
          ))}
        </div>

        {/* top ink wash */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-dark/[0.03] to-transparent" />
        {/* bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 text-center pt-8 md:pt-10 lg:pt-12 pb-8">
        <h1 className="hero-title font-poppins font-extrabold text-dark leading-[1.3] tracking-tight max-w-[820px] mx-auto text-balance px-2">
          <span className="block text-[36px] md:text-[44px] lg:text-[56px] xl:text-[62px]">
            Korean Noodles{" "}
          </span>
          <span className="block text-primary text-[36px] md:text-[44px] lg:text-[56px] xl:text-[62px]">
            Made to Warm Your Soul
          </span>
        </h1>
        <p className="hero-sub font-inria text-muted text-[14px] md:text-[15px] leading-[1.75] max-w-[560px] mx-auto mt-4 md:mt-5">
          Authentic Korean flavors, rich broth, chewy noodles, and delicious
          toppings — all in one comforting bowl.
        </p>

        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 md:mt-7 w-full max-w-[360px] sm:max-w-none mx-auto">
          <button
            onClick={() => scrollTo("reservation")}
            className="bg-primary text-white font-poppins font-semibold text-[13px] md:text-[14px] tracking-[0.06em] px-8 py-3.5 min-h-[48px] rounded-full hover:bg-primary-hover hover:shadow-lg active:scale-[0.98] transition-all shadow-md w-full sm:w-auto"
          >
            RESERVE A TABLE
          </button>
          <button
            onClick={() => scrollTo("menu")}
            className="bg-white text-dark font-poppins font-semibold text-[13px] md:text-[14px] tracking-[0.06em] px-8 py-3.5 min-h-[48px] rounded-full border-2 border-dark/10 hover:border-dark hover:bg-white hover:shadow-md active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            EXPLORE MENU
          </button>
        </div>

        {/* Spicy noodle bowl - fit whole image, no crop */}
        <div className="hero-sushi relative mt-6 md:mt-10 lg:mt-12 flex justify-center select-none">
          <div className="relative w-[92%] md:w-[78%] lg:w-[760px] rounded-[20px] md:rounded-[28px] overflow-hidden bg-white p-1.5 md:p-2 shadow-[0_20px_60px_rgba(41,43,44,0.12),0_8px_20px_rgba(41,43,44,0.08)] border border-dark/5">
            <div className="rounded-[14px] md:rounded-[20px] overflow-hidden aspect-[16/10] md:aspect-[16/9] bg-background">
              <img
                src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=700&fit=crop"
                alt="Borcelle Spicy Noodle"
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
