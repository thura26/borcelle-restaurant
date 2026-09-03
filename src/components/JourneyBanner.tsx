export function JourneyBanner() {
  const scrollToReservation = () => {
    const el = document.getElementById("reservation");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };

  return (
    <section className="relative bg-dark overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative flex items-center justify-center py-10 md:py-10 px-4 min-h-[180px] md:min-h-0">
        {/* left sushi - desktop large */}
        <img
          src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center"
          alt=""
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[240px] h-[140px] object-cover rounded-full rotate-12"
        />
        {/* left sushi - mobile small, behind text, not covering */}
        <img
          src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center"
          alt=""
          className="lg:hidden absolute -left-6 top-1/2 -translate-y-1/2 w-[110px] h-[75px] object-cover rounded-full rotate-12 opacity-30 pointer-events-none"
        />

        <div className="relative z-10 text-center px-4 md:px-20 lg:px-0 max-w-[320px] md:max-w-none mx-auto">
          <h2 className="font-poppins font-bold text-background text-[18px] md:text-[28px] lg:text-[30px] leading-[1.15] tracking-tight">
            A JOURNEY THROUGH AUTHENTIC
            <br />
            KOREAN FLAVORS
          </h2>
          <button
            onClick={scrollToReservation}
            className="mt-4 md:mt-5 bg-primary text-white font-poppins font-semibold text-[13px] md:text-[14px] tracking-[0.06em] px-7 py-3 min-h-[44px] rounded-full hover:bg-white hover:text-primary hover:shadow-lg active:scale-[0.98] transition-all"
          >
            RESERVE A TABLE
          </button>
        </div>

        {/* right sushi - desktop */}
        <img
          src="https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=300&h=300&fit=crop&crop=center"
          alt=""
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[240px] h-[140px] object-cover rounded-full -rotate-12"
        />
        {/* right sushi - mobile */}
        <img
          src="https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=300&h=300&fit=crop&crop=center"
          alt=""
          className="lg:hidden absolute -right-6 top-1/2 -translate-y-1/2 w-[110px] h-[75px] object-cover rounded-full -rotate-12 opacity-30 pointer-events-none"
        />
      </div>
    </section>
  );
}