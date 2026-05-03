
import { FoodMetric, DietType } from './types';

export const FOOD_METRICS: Record<string, FoodMetric> = {
    "beef_mince":      {"price_gbp": 5.40, "shelf_life": 3,  "co2_kg": 32.4, "diet": DietType.NON_VEG},
    "chicken_breast":  {"price_gbp": 6.80, "shelf_life": 4,  "co2_kg": 4.90, "diet": DietType.NON_VEG},
    "pork_sausages":   {"price_gbp": 3.20, "shelf_life": 5,  "co2_kg": 5.10, "diet": DietType.NON_VEG},
    "lamb_chops":      {"price_gbp": 9.20, "shelf_life": 3,  "co2_kg": 29.5, "diet": DietType.NON_VEG},
    "salmon_fillets":  {"price_gbp": 8.50, "shelf_life": 2,  "co2_kg": 5.40, "diet": DietType.PESCETARIAN},
    "eggs_12pk":       {"price_gbp": 3.10, "shelf_life": 21, "co2_kg": 4.60, "diet": DietType.VEGETARIAN},
    "tofu_block":      {"price_gbp": 2.50, "shelf_life": 14, "co2_kg": 1.60, "diet": DietType.VEGAN},
    "halal_chicken":   {"price_gbp": 7.10, "shelf_life": 4,  "co2_kg": 4.90, "diet": DietType.HALAL},
    "milk_2pint":      {"price_gbp": 1.45, "shelf_life": 7,  "co2_kg": 1.33, "diet": DietType.VEGETARIAN},
    "cheddar_cheese":  {"price_gbp": 3.80, "shelf_life": 30, "co2_kg": 21.0, "diet": DietType.VEGETARIAN},
    "paneer":          {"price_gbp": 4.50, "shelf_life": 10, "co2_kg": 8.50, "diet": DietType.VEGETARIAN},
    "greek_yoghurt":   {"price_gbp": 2.10, "shelf_life": 10, "co2_kg": 2.50, "diet": DietType.VEGETARIAN},
    "butter_salted":   {"price_gbp": 2.30, "shelf_life": 45, "co2_kg": 12.0, "diet": DietType.VEGETARIAN},
    "hummus_pot":      {"price_gbp": 1.60, "shelf_life": 5,  "co2_kg": 1.20, "diet": DietType.VEGAN},
    "spinach_bag":     {"price_gbp": 1.70, "shelf_life": 4,  "co2_kg": 2.10, "diet": DietType.VEGAN},
    "mushrooms_cup":   {"price_gbp": 1.20, "shelf_life": 5,  "co2_kg": 1.50, "diet": DietType.VEGAN},
    "tomatoes_vined":  {"price_gbp": 2.40, "shelf_life": 7,  "co2_kg": 2.00, "diet": DietType.VEGAN},
    "strawberries":    {"price_gbp": 3.00, "shelf_life": 3,  "co2_kg": 1.80, "diet": DietType.VEGAN},
    "broccoli_head":   {"price_gbp": 0.90, "shelf_life": 7,  "co2_kg": 1.10, "diet": DietType.VEGAN},
    "avocado_2pk":     {"price_gbp": 2.10, "shelf_life": 4,  "co2_kg": 2.40, "diet": DietType.VEGAN},
    "potatoes_2kg":    {"price_gbp": 1.80, "shelf_life": 21, "co2_kg": 0.50, "diet": DietType.VEGAN},
    "onions_3pk":      {"price_gbp": 1.05, "shelf_life": 30, "co2_kg": 0.40, "diet": DietType.VEGAN},
    "pasta_500g":      {"price_gbp": 0.95, "shelf_life": 365, "co2_kg": 1.40, "diet": DietType.VEGAN},
    "rice_1kg":        {"price_gbp": 1.85, "shelf_life": 365, "co2_kg": 3.50, "diet": DietType.VEGAN},
    "bread_loaf":      {"price_gbp": 1.40, "shelf_life": 5,   "co2_kg": 1.60, "diet": DietType.VEGAN},
    "olive_oil":       {"price_gbp": 7.50, "shelf_life": 365, "co2_kg": 4.20, "diet": DietType.VEGAN},
    "flour_1.5kg":     {"price_gbp": 1.10, "shelf_life": 240, "co2_kg": 0.70, "diet": DietType.VEGAN},
    "baked_beans":     {"price_gbp": 0.85, "shelf_life": 730, "co2_kg": 1.20, "diet": DietType.VEGAN},
    "red_lentils":     {"price_gbp": 1.90, "shelf_life": 365, "co2_kg": 0.90, "diet": DietType.VEGAN},
    "quinoa_500g":     {"price_gbp": 2.80, "shelf_life": 365, "co2_kg": 1.10, "diet": DietType.VEGAN},
    "chickpeas_tin":   {"price_gbp": 0.70, "shelf_life": 730, "co2_kg": 0.80, "diet": DietType.VEGAN},
    "oat_milk_1l":     {"price_gbp": 1.95, "shelf_life": 5,   "co2_kg": 0.90, "diet": DietType.VEGAN},
    "frozen_peas_1kg": {"price_gbp": 1.40, "shelf_life": 180, "co2_kg": 1.10, "diet": DietType.VEGAN},
    "greek_halloumi":  {"price_gbp": 2.75, "shelf_life": 25,  "co2_kg": 18.5, "diet": DietType.VEGETARIAN},
    "microwave_rice":  {"price_gbp": 1.10, "shelf_life": 120, "co2_kg": 3.10, "diet": DietType.VEGAN},
    "turkey_mince":    {"price_gbp": 4.50, "shelf_life": 3,   "co2_kg": 5.80, "diet": DietType.NON_VEG}
};

const DEFAULT_FOOD_METRIC: FoodMetric = {
    price_gbp: 2.5,
    shelf_life: 7,
    co2_kg: 2.5,
    diet: DietType.VEGAN,
};

export const calculateWasteRisk = (itemKey: string, daysRemaining: number, userCookingScore: number): number => {
    const data = FOOD_METRICS[itemKey] || DEFAULT_FOOD_METRIC;

    // 1. EXPIRY RISK (50%)
    const expiryFactor = Math.max(0, (1 - (daysRemaining / data.shelf_life)));
    const expiryScore = expiryFactor * 50;

    // 2. FINANCIAL RISK (25%)
    // More expensive items (in GBP) are higher priority
    const financialScore = Math.min(25, (data.price_gbp / 10.0) * 25);

    // 3. BEHAVIORAL RISK (25%)
    const behavioralScore = (1 - userCookingScore) * 25;

    return Number((expiryScore + financialScore + behavioralScore).toFixed(2));
};

export const getPriorityLevel = (score: number): string => {
    if (score > 75) return "🔴 CRITICAL (Rescue Now)";
    if (score > 45) return "🟡 WARNING (Use Soon)";
    return "🟢 STABLE";
};

export const ALLERGEN_OPTIONS = [
    "peanuts", "tree_nuts", "dairy", "gluten", "eggs",
    "shellfish", "fish", "sesame", "soy", "mustard",
    "celery", "sulphites", "lupin", "molluscs",
];

export const DIETARY_OPTIONS = [
    "vegetarian", "vegan", "halal", "kosher", "pescatarian",
    "no_beef", "no_pork", "lactose_free",
];
