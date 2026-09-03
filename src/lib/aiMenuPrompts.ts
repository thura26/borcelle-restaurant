import { BRAND } from "./brand";
import type { MenuTab } from "./data";

export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_MODEL_FALLBACK = "gemini-1.5-pro";

export function buildGeminiSystemPrompt(params: {
  tab: MenuTab;
  count: number;
  prompt: string;
  priceMin?: number;
  priceMax?: number;
}): string {
  const { tab, count, prompt, priceMin, priceMax } = params;
  const priceRule = priceMin && priceMax ? `Price MUST be between ${priceMin} and ${priceMax} MMK.` : `Price between 8000 and 65000 MMK.`;
  const trimmedPrompt = prompt.trim() ? `User theme: "${prompt.trim()}".` : `User theme: authentic Korean Borcelle style.`;

  return `You are ${BRAND.name} Head Chef — ${BRAND.fullName} (${BRAND.tagline}), Yangon’s iconic 7-levels spicy noodle Korean restaurant since 2019.

Task: Generate ${count} NEW menu items for category "${tab}". Categories: SPICY NOODLES | BIBIMBAP | K-BBQ | FRIED | SOUPS | DRINKS.

Constraints (STRICT):
- Name: ENGLISH UPPER CASE, <60 chars, Borcelle style like "BORCELLE SPICY LV.5 - HOT", "YANGNYEOM CHICKEN", "BULGOGI PLATTER". Unique, mouth-watering, append distinctive suffix if needed.
- Desc: 12-20 words, tasty authentic Korean, mention key ingredients/technique. English only.
- Price: integer MMK (no commas). ${priceRule} Must be realistic for Yangon Korean restaurant.
- Stock: integer 10-80.
- Image: direct Unsplash URL "https://images.unsplash.com/photo-XXXXXXXX?w=600&h=600&fit=crop" relevant to dish. Use existing valid Unsplash IDs only (choose from examples). Do NOT invent fake domains.
- ${trimmedPrompt}
- Tab context: "${tab}" — item must fit that category literally. Do NOT generate sushi/sashimi/nigiri.
- Return ONLY valid JSON array, no markdown, no explanation. Schema: [{"name":"...","desc":"...","price":25000,"stock":30,"image":"https://images.unsplash.com/..."}]

Examples for "${tab}":
${getFewShotExamples(tab)}`;
}

function getFewShotExamples(tab: MenuTab): string {
  const examples: Record<MenuTab, string> = {
    "SPICY NOODLES": `  {"name":"BORCELLE SPICY LV.3 - MEDIUM","desc":"Balanced heat with gochujang depth, springy noodles, pork chashu and green onions.","price":22000,"stock":35,"image":"https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=600&fit=crop"}
  {"name":"CHEESY BULDAK","desc":"Buldak topped with bubbling mozzarella, creamy meets fiery, sesame finish.","price":30000,"stock":28,"image":"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop"}`,
    BIBIMBAP: `  {"name":"STONE BIBIMBAP","desc":"Sizzling stone bowl, rice, veggies, gochujang and fried egg, mix it loud.","price":26800,"stock":30,"image":"https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop"}
  {"name":"BULGOGI BIBIMBAP","desc":"Marinated bulgogi beef over rice with kimchi and greens, sweet-savory.","price":28500,"stock":32,"image":"https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop"}`,
    "K-BBQ": `  {"name":"SAMGYEOPSAL SET","desc":"Thick pork belly, lettuce, garlic, kimchi, charcoal grilled perfection.","price":48500,"stock":20,"image":"https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop"}
  {"name":"GALBI SHORT RIB","desc":"LA galbi, soy-sweet glaze, tender and juicy, seared over charcoal.","price":55000,"stock":18,"image":"https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop"}`,
    FRIED: `  {"name":"YANGNYEOM CHICKEN","desc":"Double fried, sweet-spicy yangnyeom glaze, sesame crunch, juicy inside.","price":32500,"stock":40,"image":"https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=600&fit=crop"}
  {"name":"CHEESE TTEOKBOKKI","desc":"Chewy rice cakes, gochujang, bubbling cheese, street-food soul.","price":18500,"stock":35,"image":"https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop"}`,
    SOUPS: `  {"name":"KIMCHI JJIGAE","desc":"Fermented kimchi stew, pork belly, bubbling hot, deep tang.","price":22000,"stock":25,"image":"https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop"}
  {"name":"SUNDUBU JJIGAE","desc":"Silky tofu stew, spicy, egg cracked in, earthy and warming.","price":23500,"stock":26,"image":"https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop"}`,
    DRINKS: `  {"name":"PEACH SOJU","desc":"Sweet peach soju, fruity and easy, chilled shot, Borcelle classic.","price":15000,"stock":50,"image":"https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=600&fit=crop"}
  {"name":"YUJA TEA - HOT","desc":"Citron tea, honey sweet, warming, aromatic Korean winter comfort.","price":9000,"stock":60,"image":"https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&h=600&fit=crop"}`,
  };
  return examples[tab] || examples["SPICY NOODLES"];
}

export const MOCK_IMAGES_BY_TAB: Record<MenuTab, string[]> = {
  "SPICY NOODLES": [
    "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=600&fit=crop",
  ],
  BIBIMBAP: [
    "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=600&fit=crop",
  ],
  "K-BBQ": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=600&fit=crop",
  ],
  FRIED: [
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1496318447583-f524534e9ce1?w=600&h=600&fit=crop",
  ],
  SOUPS: [
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=600&fit=crop",
  ],
  DRINKS: [
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1496318447583-f524534e9ce1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=600&fit=crop",
  ],
};