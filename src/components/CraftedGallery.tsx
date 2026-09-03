export function CraftedGallery() {
  return (
    <section id="gallery" className="bg-background pt-6 md:pt-8 pb-6">
      <div className="max-w-[1160px] mx-auto px-4 md:px-8">
        <div className="text-center mb-6 md:mb-7">
          <p className="font-poppins font-semibold text-primary text-[12px] md:text-[13px] tracking-[0.14em]">7 LEVELS • 1 SOUL</p>
          <h2 className="font-poppins font-bold text-dark text-[26px] md:text-[30px] lg:text-[32px] leading-[1.1] tracking-tight mt-1.5">
            TRADITIONAL
            <br />
            KOREAN CUISINE
          </h2>
        </div>

        <div className="relative bg-surface/50 p-2 sm:p-3 rounded-xl md:rounded-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 auto-rows-[130px] sm:auto-rows-[160px] md:auto-rows-[200px]">
            {/* 1 - skewers */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* 2 - sushi */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* 3 - gyoza - now visible on phone too */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bayon text-xs">GYOZA</span>
              </div>
            </div>

            {/* 4 - bento */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* 5 - lobster/salad */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* 6 - restaurant interior */}
            <div className="rounded-lg md:rounded-xl overflow-hidden bg-dark relative group">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* center overlay - responsive */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-3 sm:p-4">
            <div className="bg-primary text-background font-bayon text-center px-5 sm:px-7 md:px-10 py-4 sm:py-7 md:py-8 rounded-sm shadow-xl pointer-events-auto max-w-[88%] sm:max-w-[360px] md:max-w-[440px]">
              <p className="text-[13px] sm:text-[16px] md:text-[20px] leading-[1.08] tracking-tight">
                CRAFTED WITH TRADITION,
                <br />
                SERVED WITH GRACE
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
