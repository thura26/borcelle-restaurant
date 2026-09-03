export const validators = {
  name: (v: string) => {
    if (!v.trim()) return "Name required";
    if (v.trim().length < 2) return "Min 2 chars";
    if (v.trim().length > 60) return "Max 60 chars";
    return null;
  },
  price: (v: number) => {
    if (isNaN(v) || v < 1000) return "Price must be >= 1000 MMK";
    if (v > 500000) return "Max 500,000";
    return null;
  },
  stock: (v: number) => {
    if (isNaN(v) || v < 0 || v > 999) return "Stock 0-999";
    return null;
  },
  promoCode: (v: string) => {
    const c = v.trim().toUpperCase();
    if (!c) return "Code required";
    if (!/^[A-Z0-9]{3,12}$/.test(c)) return "3-12 alphanumeric";
    return null;
  },
  imageSize: (b64: string | undefined) => {
    if (!b64) return null;
    if (b64.length > 5 * 1024 * 1024) return "Image too large (max 5MB)";
    return null;
  },
};