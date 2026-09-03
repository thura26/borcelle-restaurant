import { Star } from "lucide-react";

export function Chef() {

  return (
    <section className="bg-background pt-6 md:pt-10 pb-6 relative overflow-hidden">
      {/* bamboo top right */}
      <div className="absolute right-0 top-0 w-20 opacity-40 pointer-events-none hidden md:block">
        <svg viewBox="0 0 80 140" className="w-full">
          <path d="M60 10 Q40 20 30 40 Q20 50 5 55 M60 30 Q35 40 25 60 M60 50 Q35 60 20 80" stroke="#171717" strokeWidth="1" fill="none" />
          <ellipse cx="5" cy="55" rx="10" ry="4" fill="#171717" />
        </svg>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="relative bg-dark overflow-hidden rounded-sm aspect-[4/3] md:aspect-[4/5] lg:aspect-[3/4] max-w-[500px] mx-auto lg:mx-0 w-full max-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&fit=crop&crop=face"
            alt="Head Chef"
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&h=700&fit=crop"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/10 to-transparent pointer-events-none" />
        </div>

        <div className="relative flex flex-col justify-center">
          {/* faint mountain bg */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none -z-10">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <path d="M0 300 L150 150 L300 250 L450 100 L600 200 L600 400 L0 400 Z" fill="#171717" />
            </svg>
          </div>

          <p className="font-bayon text-dark text-[15px] sm:text-[16px] md:text-[18px] lg:text-[19px] leading-[1.2] max-w-[440px] text-balance">
            FOOD IS NOT JUST NOURISHMENT — IT IS MEMORY, SEASON, AND GRATITUDE
          </p>
          <p className="font-bayon text-dark/60 text-[11px] md:text-[12px] tracking-wide mt-2">— HEAD CHEF, BORCELLE</p>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 max-w-[520px]">
            <div className="bg-surface/90 rounded-sm min-h-[110px] md:min-h-[122px] p-5 md:p-6 flex flex-col items-center justify-center text-center">
              <p className="font-poppins font-bold text-primary text-[30px] md:text-[32px] lg:text-[34px] leading-none">80+</p>
              <p className="font-poppins font-semibold text-primary text-[11px] md:text-[12px] tracking-[0.1em] mt-1">DISHES</p>
            </div>
            <div className="bg-surface/90 rounded-sm min-h-[110px] md:min-h-[122px] p-5 md:p-6 flex flex-col items-center justify-center text-center">
              <p className="font-poppins font-bold text-primary text-[30px] md:text-[32px] lg:text-[34px] leading-none">25+</p>
              <p className="font-poppins font-semibold text-primary text-[11px] md:text-[12px] tracking-[0.1em] mt-1">YEARS MASTERY</p>
            </div>
            <div className="bg-surface/90 rounded-sm min-h-[110px] md:min-h-[122px] p-5 md:p-6 flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-1.5">
                <p className="font-poppins font-bold text-primary text-[26px] md:text-[30px] lg:text-[32px] leading-none">10+</p>
                <div className="flex text-primary gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="w-3 h-3 md:w-[13px] md:h-[13px] fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <p className="font-poppins font-semibold text-primary text-[10px] md:text-[11px] leading-tight tracking-[0.08em] mt-1.5">INTERNATIONAL AWARDS</p>
              <p className="font-poppins font-semibold text-primary text-[10px] md:text-[11px] tracking-[0.08em]">FINE DINING</p>
            </div>
            <div className="bg-surface/90 rounded-sm min-h-[110px] md:min-h-[122px] p-5 md:p-6 flex flex-col items-center justify-center text-center">
              <p className="font-poppins font-bold text-primary text-[30px] md:text-[32px] lg:text-[34px] leading-none">500+</p>
              <p className="font-poppins font-semibold text-primary text-[11px] md:text-[12px] tracking-[0.1em] mt-1">HAPPY GUESTS</p>
              <p className="font-poppins font-semibold text-primary text-[10px] md:text-[10px] tracking-[0.08em] opacity-80 mt-0.5">DAILY</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
