
export enum DietType {
  VEGAN = 'Vegan',
  VEGETARIAN = 'Vegetarian',
  HALAL = 'Halal',
  NON_VEG = 'Non-Veg',
  PESCETARIAN = 'Pescetarian'
}

export interface FoodMetric {
  price_gbp: number;
  shelf_life: number;
  co2_kg: number;
  diet: DietType;
}

export interface InventoryItem {
  id: string;
  item_key: string;
  name: string;
  quantity: number;
  added_date: string;
  expiry_date: string;
  days_remaining: number;
  risk_score: number;
  priority: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  prep_time?: string;
  cook_time?: string;
}

export interface Recipe {
  recipe_name: string;
  description: string; // New field for AI impact summary
  serving_size: string;
  total_time: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  missing_ingredients: string[];
  missing_ingredients_cost_gbp: number;
  safety_confirmation: string;
  impact: {
    gbp_saved: number;
    co2_saved_kg: number;
  };
}

export interface UserProfile {
  allergies: string[];
  dietary_preferences: string[];
  cooking_score: number; // 0.0 to 1.0
}

export interface CommunityListing {
  id: string;
  user: string;
  item: string;
  quantity: number;
  expiry: string;
  meeting_address: string; // New field for specific location
  notes: string;
  allergens: string[];
  vicinity_hazards: string[];
  dietary_tags: string[];
  status: 'available' | 'claimed';
}
