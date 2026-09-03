import type { MenuTab } from "./data";
import { MOCK_IMAGES_BY_TAB } from "./aiMenuPrompts";

export type AIGeneratedItem = {
  name: string;
  desc: string;
  price: number;
  stock: number;
  image: string;
};

export type AIGenerateParams = {
  tab: MenuTab;
  count: number;
  prompt: string;
  priceMin?: number;
  priceMax?: number;
};

// Mock-only mode — no Gemini needed
export function getGeminiKey(): string | null { return null; }
export function setGeminiKey(_key: string) {}
export function hasGeminiKey(): boolean { return false; }

const MOCK_POOL: Record<MenuTab, Array<{ name: string; desc: string; price: number }>> = {
  "SPICY NOODLES": [
    { name: "BORCELLE SPICY MISO NOODLE", desc: "Rich miso broth, 7-level chili, chashu pork, soft egg and bamboo.", price: 24500 },
    { name: "FIRE KIMCHI RAMEN", desc: "Aged kimchi fire broth, enoki, tofu, scallion, tangy heat.", price: 23500 },
    { name: "CHEESY VOLCANO NOODLE", desc: "Extra cheesy bubbling top, volcanic chili oil, chewy noodles.", price: 31500 },
    { name: "SEAFOOD HELL NOODLE", desc: "Mussels, shrimp, squid in red inferno broth, briny and bold.", price: 33000 },
    { name: "VEGAN GARDEN SPICY NOODLE", desc: "Plant broth, mushrooms, greens, clean gochujang heat.", price: 21500 },
    { name: "TRUFFLE SPICY NOODLE", desc: "Truffle oil drizzle, mild heat, premium umami twist.", price: 38000 },
    { name: "COLD ICY SPICY NOODLE", desc: "Chilled buckwheat, icy chili broth, cucumber, summer refresh.", price: 22500 },
    { name: "JJAJANG FIRE NOODLE", desc: "Black bean paste with jalapeño kick, pork, onions, sweet-heat.", price: 25500 },
  ],
  BIBIMBAP: [
    { name: "BORCELLE STONE BIBIMBAP DELUXE", desc: "Sizzling stone, wagyu, veggies, fried egg, gochujang swirl.", price: 32500 },
    { name: "SPICY TUNA BIBIMBAP", desc: "Seared tuna, avocado, spicy mayo, kimchi, warm rice.", price: 29500 },
    { name: "CHEESE CORN BIBIMBAP", desc: "Melted cheese, sweet corn, veggies, kids love it.", price: 24500 },
    { name: "MUSHROOM TOFU BIBIMBAP", desc: "King oyster, crispy tofu, sesame oil, earthy and light.", price: 22500 },
    { name: "BULGOGI RICE BOWL PRO", desc: "Prime bulgogi, onions, egg, sweet pear marinade.", price: 26500 },
    { name: "KIMCHI FRIED RICE INFERNO", desc: "Wok-fired aged kimchi, pork belly, scorched egg.", price: 25500 },
    { name: "SAMGYEOPSAL BIBIMBAP", desc: "Grilled pork belly, lettuce, ssamjang on rice.", price: 28500 },
    { name: "SEAWEED TUNA MAYO BOWL", desc: "Creamy tuna mayo, corn, seaweed flakes, comfort.", price: 19500 },
  ],
  "K-BBQ": [
    { name: "BORCELLE SAMGYEOPSAL PREMIUM", desc: "500g thick pork belly, charcoal, lettuce, garlic, kimchi.", price: 52000 },
    { name: "WAGYU BULGOGI PLATTER", desc: "Wagyu ribeye, pear marinade, caramel sear.", price: 68000 },
    { name: "SPICY GOCHUJANG GALBI", desc: "Marinated short rib, chili sweet glaze, smoky heat.", price: 58000 },
    { name: "HERB PORK JOWL BBQ", desc: "Charred jowl, salt pepper, herbs, crisp fat.", price: 42000 },
    { name: "DAKGALBI CHEESE BBQ", desc: "Spicy chicken, veggies, melting cheese pot.", price: 39000 },
    { name: "MUSHROOM VEGGIE BBQ PLATE", desc: "King oyster, peppers, asparagus, smoky vegan grill.", price: 26000 },
    { name: "BORCELLE BBQ FEAST FOR 2", desc: "Samgyeopsal + bulgogi + soup + 6 sides, love share.", price: 72000 },
    { name: "BEEF TONGUE SALT GRILL", desc: "Thin tongue, lemon salt, quick sear, chewy tender.", price: 48000 },
  ],
  FRIED: [
    { name: "BORCELLE YANGNYEOM CHICKEN XL", desc: "Double fried, sweet-spicy yangnyeom, sesame, huge crunch.", price: 34000 },
    { name: "GARLIC SOY CRISPY CHICKEN", desc: "Garlic soy glaze, crackling skin, juicy inside.", price: 32000 },
    { name: "HONEY BUTTER TTEOKBOKKI", desc: "Honey butter rice cakes, sweet kids favorite.", price: 19500 },
    { name: "SEAFOOD PAJEON CRISPY", desc: "Green onion, squid, shrimp, golden crisp, dip.", price: 24000 },
    { name: "KIMCHI JEON BORCELLE STYLE", desc: "Extra kimchi, pork, crispy tangy pancake.", price: 17500 },
    { name: "CORN CHEESE MOLTEN", desc: "Sweet corn, mayo, bubbling cheese, molten pot.", price: 16000 },
    { name: "SPICY SHAKING FRIES", desc: "Seaweed chili fries, shaking flavor, addictive.", price: 12000 },
    { name: "CRISPY FRIED MANDU", desc: "Kimchi pork mandu, fried golden, soy dip.", price: 15500 },
  ],
  SOUPS: [
    { name: "BORCELLE KIMCHI JJIGAE HOT POT", desc: "Aged kimchi, pork belly, bubbling stew, soul warming.", price: 24000 },
    { name: "SUNDUBU SEAFOOD JJIGAE", desc: "Silky tofu, clams, crab, soft egg, spicy deep.", price: 26000 },
    { name: "SAMGYETANG GINSENG SOUP", desc: "Whole chicken, ginseng, dates, nourishing gold.", price: 38000 },
    { name: "DOENJANG MUSHROOM SOUP", desc: "Soybean paste, wild mushrooms, earthy home taste.", price: 21500 },
    { name: "SPICY BEEF YUKGAEJANG", desc: "Shredded beef, fern, spicy red, deep broth.", price: 27500 },
    { name: "MANDU SOUP BORCELLE", desc: "Dumpling soup, clear broth, hearty winter.", price: 22500 },
    { name: "COLD KIMCHI NAENGSOUP", desc: "Chilled kimchi broth, cucumber, summer chill.", price: 17500 },
    { name: "RAMYEON STEW CHEESE", desc: "Instant ramyeon, cheese, kimchi, bubbling pot.", price: 19000 },
  ],
  DRINKS: [
    { name: "BORCELLE PEACH SOJU FIZZ", desc: "Peach soju, yuzu soda, fizzy sweet, ice cold.", price: 16000 },
    { name: "YUJA HONEY TEA ICED", desc: "Cold citron honey tea, refreshing tart, vitamin.", price: 10000 },
    { name: "MAKGEOLLI CREAMY", desc: "Milky rice wine, sweet tang, Borcelle house.", price: 16500 },
    { name: "SOJU ORIGINAL PREMIUM", desc: "Clean Jinro, premium shot, charcoal filtered.", price: 14500 },
    { name: "DALGONA LATTE BORCELLE", desc: "Whipped coffee, sweet froth, creamy dream.", price: 13000 },
    { name: "BINGSOO MILK SHAVED", desc: "Snow shaved milk, red bean, sweet ice.", price: 15000 },
    { name: "CASS BEER TOWER", desc: "Crisp lager tower, cold, chicken perfect pair.", price: 28000 },
    { name: "SIKHYE SWEET RICE DRINK", desc: "Sweet rice drink, traditional, chilled sweet.", price: 8500 },
  ],
};

export function generateMock(params: AIGenerateParams): AIGeneratedItem[] {
  const pool = MOCK_POOL[params.tab] || MOCK_POOL["SPICY NOODLES"];
  const images = MOCK_IMAGES_BY_TAB[params.tab] || MOCK_IMAGES_BY_TAB["SPICY NOODLES"];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);
  const count = Math.min(Math.max(params.count, 1), 10);
  const lowerPrompt = params.prompt.toLowerCase();

  const result: AIGeneratedItem[] = [];
  for (let i = 0; i < count; i++) {
    const base = shuffled[i % shuffled.length];
    let name = base.name;
    // lightly personalize with prompt keywords
    if (lowerPrompt.includes("cheese") && !name.includes("CHEESE")) name = `CHEESY ${name}`;
    if (lowerPrompt.includes("spicy") && !name.includes("SPICY") && params.tab !== "DRINKS") name = name.replace("BORCELLE", "BORCELLE SPICY");
    if (lowerPrompt.includes("vegan") || lowerPrompt.includes("plant")) name = `VEGAN ${name}`;
    // price variation based on prompt
    let price = base.price;
    if (params.priceMin && params.priceMax) {
      const span = params.priceMax - params.priceMin;
      price = params.priceMin + Math.floor(Math.random() * span);
      // round to 500
      price = Math.round(price / 500) * 500;
    } else if (lowerPrompt.includes("budget") || lowerPrompt.includes("cheap")) {
      price = Math.max(8000, price - 3000 - Math.floor(Math.random() * 4000));
    } else if (lowerPrompt.includes("premium") || lowerPrompt.includes("luxury")) {
      price = price + 5000 + Math.floor(Math.random() * 6000);
    }
    price = Math.min(500000, Math.max(1000, price));
    const stock = 15 + Math.floor(Math.random() * 50);
    const image = shuffledImages[i % shuffledImages.length];
    // desc personalization
    let desc = base.desc;
    if (params.prompt.trim()) {
      desc = `${base.desc.split(".")[0].trim()}, ${params.prompt.trim().slice(0, 60).toLowerCase()} twist.`;
    }
    result.push({
      name: name.slice(0, 60).toUpperCase(),
      desc: desc.slice(0, 160),
      price,
      stock,
      image,
    });
  }
  return result;
}

export async function generateMenuWithAI(params: AIGenerateParams): Promise<{ items: AIGeneratedItem[]; source: "mock"; error?: string }> {
  // Mock-only — instant, no API, no key, offline
  await new Promise((r) => setTimeout(r, 400)); // tiny fake delay for UX
  return { items: generateMock(params), source: "mock" };
}