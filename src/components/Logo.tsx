import { BRAND } from "../lib/brand";

type LogoProps = {
  variant?: "header" | "footer" | "auth" | "admin" | "icon";
  className?: string;
  light?: boolean;
};

const LOGO_SRC = "/borcelle-logo.svg";

export function Logo({ variant = "header", className = "", light }: LogoProps) {
  const isFooter = variant === "footer";
  const alt = `${BRAND.fullName} - ${BRAND.tagline}`;
  return (
    <div className={`flex items-center select-none ${isFooter ? "justify-center" : "justify-start"} ${className}`}>
      <img
        src={LOGO_SRC}
        alt={alt}
        className={`${isFooter ? "h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 w-auto max-w-[720px]" : variant === "auth" ? "h-16 sm:h-20 w-auto" : variant === "admin" ? "h-11 md:h-12 w-auto" : "h-14 md:h-16 lg:h-16 xl:h-20 w-auto"} object-contain ${light ? "brightness-0 invert" : ""}`}
        loading="eager"
      />
    </div>
  );
}

// Header — single logo file, larger on main page
export function HeaderLogo({ light }: { light?: boolean } = {}) {
  return (
    <div className="flex items-center justify-start select-none">
      <img
        src={LOGO_SRC}
        alt={`${BRAND.fullName} - ${BRAND.tagline}`}
        className={`h-14 md:h-16 lg:h-16 xl:h-20 w-auto object-contain ${light ? "brightness-0 invert" : ""}`}
        loading="eager"
      />
    </div>
  );
}