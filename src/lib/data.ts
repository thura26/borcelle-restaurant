export type CuisineItem = {
  id: string;
  name: string;
  price: number; // MMK
  category: string;
  image: string;
};

export const cuisineCategories = [
  "ALL",
  "SPICY NOODLES",
  "BIBIMBAP",
  "K-BBQ",
  "FRIED",
  "SOUPS",
  "DRINKS",
] as const;

export const cuisineItems: CuisineItem[] = [
  {
    id: "seoul-spicy-level7",
    name: "BORCELLE SPICY NOODLE LV.7",
    price: 28500,
    category: "SPICY NOODLES",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=600&fit=crop",
  },
  {
    id: "buldak-ramen",
    name: "BULDAK FIRE NOODLE",
    price: 32000,
    category: "SPICY NOODLES",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop",
  },
  {
    id: "jajangmyeon",
    name: "JJAJANGMYEON",
    price: 25500,
    category: "SPICY NOODLES",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=600&fit=crop",
  },
  {
    id: "samgyeopsal-set",
    name: "SAMGYEOPSAL SET",
    price: 48500,
    category: "K-BBQ",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
  },
  {
    id: "bibimbap-stone",
    name: "STONE BIBIMBAP",
    price: 26800,
    category: "BIBIMBAP",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop",
  },
  {
    id: "tteokbokki-cheese",
    name: "CHEESE TTEOKBOKKI",
    price: 18500,
    category: "FRIED",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop&sat=-50",
  },
  {
    id: "korean-fried-chicken",
    name: "YANGNYEOM CHICKEN",
    price: 32500,
    category: "FRIED",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=600&fit=crop",
  },
  {
    id: "kimchi-pancake",
    name: "KIMCHI JEON",
    price: 16500,
    category: "FRIED",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=600&fit=crop",
  },
  {
    id: "bulgogi-rice",
    name: "BULGOGI RICE BOWL",
    price: 24500,
    category: "BIBIMBAP",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=600&fit=crop",
  },
];

export type MenuTab = "SPICY NOODLES" | "BIBIMBAP" | "K-BBQ" | "FRIED" | "SOUPS" | "DRINKS";
export const menuTabs: MenuTab[] = ["SPICY NOODLES", "BIBIMBAP", "K-BBQ", "FRIED", "SOUPS", "DRINKS"];

export type MenuItem = {
  name: string;
  desc: string;
  price: string;
};

export const menuData: Record<MenuTab, MenuItem[]> = {
  "SPICY NOODLES": [
    { name: "BORCELLE SPICY LV.1 - MILD", desc: "Gentle chili warmth, perfect for beginners. Creamy chicken broth with soft noodles and veggies.", price: "18,000 MMK" },
    { name: "BORCELLE SPICY LV.3 - MEDIUM", desc: "Balanced heat with gochujang depth, springy noodles, pork chashu and green onions.", price: "22,000 MMK" },
    { name: "BORCELLE SPICY LV.5 - HOT", desc: "Fiery Korean fire noodle, bold chili oil, chewy noodles, bold flavor that lingers.", price: "26,000 MMK" },
    { name: "BORCELLE SPICY LV.7 - INFERNO", desc: "Our signature 7-levels inferno. Extreme heat for true spice hunters. Challenge completed?", price: "28,500 MMK" },
    { name: "BULDAK RAMEN", desc: "Infamous fire chicken ramen, sweet-spicy, topped with melted cheese and sesame.", price: "26,000 MMK" },
    { name: "JJAJANGMYEON", desc: "Black bean paste noodles, savory and slightly sweet, with pork and onions.", price: "25,500 MMK" },
    { name: "JAPAGETTI SPICY", desc: "Stir-fried Korean noodles with spicy jjamppong broth and seafood mix.", price: "24,500 MMK" },
    { name: "KIMCHI RAMEN", desc: "Tangy aged kimchi broth, spicy and sour, with tofu and enoki mushrooms.", price: "23,000 MMK" },
    { name: "CHEESY BULDAK", desc: "Buldak topped with bubbling mozzarella, creamy meets fiery.", price: "30,000 MMK" },
    { name: "SEAFOOD SPICY NOODLE", desc: "Mixed seafood in volcanic red broth, mussels, shrimp, squid.", price: "32,000 MMK" },
    { name: "VEGAN SPICY NOODLE", desc: "Plant-based spicy broth, tofu, greens, mushrooms, clean heat.", price: "21,000 MMK" },
    { name: "COLD SPICY NOODLE", desc: "Chilled buckwheat noodles in icy spicy broth, refreshing summer hit.", price: "22,500 MMK" },
  ],
  BIBIMBAP: [
    { name: "STONE BIBIMBAP", desc: "Sizzling stone bowl, rice, veggies, gochujang and fried egg, mix it loud.", price: "26,800 MMK" },
    { name: "BULGOGI BIBIMBAP", desc: "Marinated bulgogi beef over rice with kimchi and greens.", price: "28,500 MMK" },
    { name: "TUNA BIBIMBAP", desc: "Fresh tuna, creamy avocado, spicy mayo on warm rice.", price: "27,000 MMK" },
    { name: "VEGE BIBIMBAP", desc: "Seasonal greens, mushrooms, tofu, sesame oil, light and colorful.", price: "22,000 MMK" },
    { name: "CHEESE BIBIMBAP", desc: "Melted cheese over classic bibimbap, kids favorite.", price: "24,500 MMK" },
    { name: "KIMCHI FRIED RICE", desc: "Smoky wok-fried rice with aged kimchi, pork and egg.", price: "23,000 MMK" },
    { name: "BULGOGI RICE BOWL", desc: "Sweet-savory bulgogi, onions, rice, quick and hearty.", price: "24,500 MMK" },
    { name: "SAMGYEOPSAL RICE", desc: "Grilled pork belly, lettuce wraps, kimchi rice style.", price: "26,000 MMK" },
    { name: "SPICY PORK RICE", desc: "Jeyuk bokkeum, sweet-spicy pork, cabbage, rice.", price: "25,000 MMK" },
    { name: "TOFU BIBIMBAP", desc: "Crisp tofu, greens, nutty sesame, light heat.", price: "21,500 MMK" },
    { name: "TUNA MAYO RICE", desc: "Creamy tuna mayo, corn, seaweed, comfort bowl.", price: "19,500 MMK" },
    { name: "KIMCHI RICE BALLS", desc: "Crispy fried kimchi rice balls, cheese center.", price: "18,000 MMK" },
  ],
  "K-BBQ": [
    { name: "SAMGYEOPSAL SET", desc: "Thick pork belly, lettuce, garlic, kimchi, charcoal grilled.", price: "48,500 MMK" },
    { name: "BULGOGI PLATTER", desc: "Marinated ribeye, sweet pear marinade, grilled to caramel.", price: "42,000 MMK" },
    { name: "GALBI SHORT RIB", desc: "LA galbi, soy-sweet glaze, tender and juicy.", price: "55,000 MMK" },
    { name: "SPICY GALBI", desc: "Go spicy galbi, chili marinade, smoky and hot.", price: "52,000 MMK" },
    { name: "PORK JOWL", desc: "Charred jowl, crisp and fatty, salt and pepper.", price: "38,000 MMK" },
    { name: "CHICKEN GALBI", desc: "Spicy dakgalbi, chicken, veggies, melted cheese.", price: "36,000 MMK" },
    { name: "BEEF TONGUE", desc: "Thin tongue, lemon salt, quick sear.", price: "45,000 MMK" },
    { name: "MUSHROOM BBQ", desc: "King oyster, seasonal veggies, smoky.", price: "22,000 MMK" },
    { name: "BBQ COMBO FOR 2", desc: "Samgyeopsal + bulgogi + sides, feast.", price: "68,000 MMK" },
    { name: "BBQ COMBO FOR 4", desc: "All meats, all sides, soju ready.", price: "125,000 MMK" },
    { name: "KIMCHI BBQ", desc: "Aged kimchi grilled, caramel and tang.", price: "16,000 MMK" },
    { name: "VR BBQ", desc: "Vegetarian BBQ platter, tofu and greens.", price: "28,000 MMK" },
  ],
  FRIED: [
    { name: "YANGNYEOM CHICKEN", desc: "Double fried, sweet-spicy yangnyeom glaze, sesame.", price: "32,500 MMK" },
    { name: "GARLIC FRIED CHICKEN", desc: "Crispy garlic soy, crunchy skin, juicy.", price: "30,000 MMK" },
    { name: "CHEESE TTEOKBOKKI", desc: "Chewy rice cakes, gochujang, bubbling cheese.", price: "18,500 MMK" },
    { name: "KIMCHI JEON", desc: "Crispy kimchi pancake, tangy and savory.", price: "16,500 MMK" },
    { name: "SEAFOOD PAJEON", desc: "Green onion pancake, squid and shrimp, crisp.", price: "22,000 MMK" },
    { name: "CORN CHEESE", desc: "Sweet corn, mayo, cheese, molten.", price: "15,000 MMK" },
    { name: "FRIED MANDU", desc: "Crispy dumplings, kimchi and pork, dip.", price: "14,000 MMK" },
    { name: "TTEOKKOCHI", desc: "Skewered rice cakes, spicy sauce, street style.", price: "12,000 MMK" },
    { name: "CHICKEN TTEOKBOKKI", desc: "Tteokbokki + fried chicken combo, perfect pair.", price: "28,000 MMK" },
    { name: "SPICY FRIES", desc: "Shaking fries, chili powder, seaweed.", price: "10,000 MMK" },
    { name: "HONEY BUTTER CHICKEN", desc: "Sweet honey butter, kids love.", price: "31,000 MMK" },
    { name: "JAPCHAE", desc: "Glass noodles, veggies, beef, sesame, stir fried.", price: "24,000 MMK" },
  ],
  SOUPS: [
    { name: "KIMCHI JJIGAE", desc: "Fermented kimchi stew, pork belly, bubbling hot.", price: "22,000 MMK" },
    { name: "DOENJANG JJIGAE", desc: "Soybean paste stew, tofu, veggies, earthy.", price: "20,000 MMK" },
    { name: "SUNDUBU JJIGAE", desc: "Silky tofu stew, spicy, egg cracked in.", price: "23,500 MMK" },
    { name: "SAMGYETANG", desc: "Ginseng chicken soup, nourishing, warm.", price: "35,000 MMK" },
    { name: "TTEOKGUK", desc: "Seoul's rice cake soup, clear broth, festive.", price: "19,000 MMK" },
    { name: "MANDU SOUP", desc: "Dumpling soup, clear broth, hearty.", price: "21,000 MMK" },
    { name: "SPICY BEEF SOUP", desc: "Yukgaejang, shredded beef, spicy and deep.", price: "26,000 MMK" },
    { name: "SEAFOOD SOONTOFU", desc: "Spicy soft tofu with clams and crab.", price: "24,500 MMK" },
    { name: "COLD KIMCHI SOUP", desc: "Chilled kimchi broth, refreshing summer.", price: "16,000 MMK" },
    { name: "BULGOGI STEW", desc: "Beef bulgogi in sweet broth, veggies.", price: "28,000 MMK" },
    { name: "RAMYEON STEW", desc: "Instant ramyeon stew, cheese and kimchi, bubbling.", price: "18,000 MMK" },
    { name: "MUSHROOM SOUP", desc: "Creamy mushroom, Korean herbs.", price: "17,000 MMK" },
  ],
  DRINKS: [
    { name: "SOJU ORIGINAL", desc: "Clean Jinro, chilled shot, classic.", price: "14,000 MMK" },
    { name: "PEACH SOJU", desc: "Sweet peach soju, fruity and easy.", price: "15,000 MMK" },
    { name: "MAKGEOLLI", desc: "Milky rice wine, sweet and tangy.", price: "16,000 MMK" },
    { name: "KOREAN BEER - CASS", desc: "Crisp lager, perfect with chicken.", price: "10,000 MMK" },
    { name: "KOREAN BEER - TERRA", desc: "Smooth lager, clean finish.", price: "10,000 MMK" },
    { name: "BOKBUNJA", desc: "Raspberry wine, sweet and deep.", price: "18,000 MMK" },
    { name: "YUJA TEA - HOT", desc: "Citron tea, honey sweet, warming.", price: "9,000 MMK" },
    { name: "YUJA TEA - COLD", desc: "Iced citron, refreshing and tart.", price: "9,500 MMK" },
    { name: "DALGONA LATTE", desc: "Whipped coffee latte, sweet and frothy.", price: "12,000 MMK" },
    { name: "BINGSOO MILK", desc: "Shaved ice milk, sweet", price: "14,000 MMK" },
    { name: "SOJU COCKTAIL", desc: "Soju + yuzu + soda, fizzy.", price: "16,000 MMK" },
    { name: "SIKHYE", desc: "Sweet rice drink, traditional.", price: "8,000 MMK" },
  ],
};

export const testimonials = [
  {
    name: "MIN-JUN KIM",
    text: "Borcelle's 7-Level Spicy Noodle is not just food, it's a challenge. I conquered Level 7 and the cheese buldak after - perfect heat, perfect cheese. This is Borcelle's soul in Yangon.",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop",
    rating: 5,
  },
  {
    name: "JI-HYE PARK",
    text: "As a Korean living abroad, Borcelle tastes like home. The kimchi jjigae, the sizzling bibimbap, the soju - everything is authentic, and the staff feels like family.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
    rating: 5,
  },
  {
    name: "THURA AUNG",
    text: "Tried Level 5 spicy noodle with friends - we were sweating, laughing, and loving it. Yangnyeom chicken + cold yuja tea is the perfect combo after the fire!",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    rating: 5,
  },
];

export const soulGalleryImages = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500&h=500&fit=crop",
];

export const tickerItems = [
  { label: "7-LEVELS SPICY NOODLE", icon: "Flame" },
  { label: "BULDAK RAMEN", icon: "Soup" },
  { label: "BIBIMBAP", icon: "Soup" },
  { label: "SAMGYEOPSAL", icon: "Utensils" },
  { label: "TTEOKBOKKI", icon: "Flame" },
  { label: "YANGNYEOM CHICKEN", icon: "Utensils" },
  { label: "KIMCHI", icon: "Soup" },
  { label: "SOJU", icon: "Glass" },
  { label: "MANDU", icon: "Package" },
];
