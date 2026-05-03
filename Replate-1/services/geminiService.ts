import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Recipe, InventoryItem, UserProfile, FoodMetric } from "../types";
import { FOOD_METRICS } from "../constants";

const PREFERRED_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

const normalizeFoodKey = (key: string): string =>
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const findFoodMetric = (key: string): FoodMetric | null => {
  const normalized = normalizeFoodKey(key);
  if (!normalized) return null;

  if (FOOD_METRICS[normalized]) return FOOD_METRICS[normalized];

  const exactMatch = Object.keys(FOOD_METRICS).find(
    (metricKey) => normalizeFoodKey(metricKey) === normalized
  );
  if (exactMatch) return FOOD_METRICS[exactMatch];

  const looseMatch = Object.keys(FOOD_METRICS).find((metricKey) => {
    const normalizedMetric = normalizeFoodKey(metricKey);
    return (
      normalizedMetric.includes(normalized) ||
      normalized.includes(normalizedMetric) ||
      normalizedMetric.startsWith(normalized) ||
      normalized.startsWith(normalizedMetric)
    );
  });

  return looseMatch ? FOOD_METRICS[looseMatch] : null;
};

const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Gemini API key is missing.");
  }

  return apiKey.trim();
};

export const listAvailableModels = async () => {
  const apiKey = getGeminiApiKey();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!response.ok) {
      throw new Error(`List models failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.models ?? []).map((model: any) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      supportedGenerationMethods: model.supportedGenerationMethods,
    }));
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
};

const getBestAvailableModelName = async () => {
  try {
    const models = await listAvailableModels();
    const supported = models.filter((model: any) =>
      Array.isArray(model.supportedGenerationMethods) &&
      model.supportedGenerationMethods.includes("generateContent")
    );

    for (const name of PREFERRED_MODELS) {
      if (supported.some((model: any) => model.name === name)) {
        return name;
      }
    }

    if (supported.length > 0) {
      return supported[0].name;
    }

    throw new Error(
      `No Gemini model available for generateContent. Available models: ${models.map((m: any) => m.name).join(", ")}`
    );
  } catch (error) {
    console.error("Error selecting model:", error);
    // Fallback to preferred models in order if listing fails
    return PREFERRED_MODELS[0];
  }
};

const createGeminiModel = async (systemInstruction: string) => {
  const apiKey = getGeminiApiKey();
  const modelName = await getBestAvailableModelName();
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });
};

export const generateRescueRecipes = async (
  mandatoryIngredients: InventoryItem[],
  userProfile: UserProfile
): Promise<Recipe[]> => {
  const totalImpact = mandatoryIngredients.reduce(
    (acc, ing) => {
      let data = findFoodMetric(ing.item_key);
      if (!data && ing.name) {
        data = findFoodMetric(ing.name);
      }
      if (data) {
        acc.gbp += data.price_gbp;
        acc.co2 += data.co2_kg;
      }
      return acc;
    },
    { gbp: 0, co2: 0 }
  );

  const systemInstruction = `You are the Re:Plate Kitchen Engine. Your goal is to reboot the user's food supply chain.
You act as a cooking coach for a beginner home cook with no prior kitchen experience.

Core Logic:
1. Mandatory Ingredients: You MUST use ALL items provided in the mandatory list. These are at high waste risk.
2. Safety Guard: Strictly adhere to Allergy_Profile and Dietary_Preference.
3. Ingredient Detail: Include each ingredient with quantity, prep time, and cook time where applicable.
4. Beginner Steps: Write cooking steps in plain, simple language that a person who has never cooked before can follow.
5. Missing Links: Identify exactly what is missing to complete a high-quality Rescue Meal.
6. Bragging Rights: In the description field, explain how this meal saves money and reduces CO2.

Constraints:
- Return exactly 3 recipes in a valid JSON array.
- Use 5 to 10 clear, numbered instructions for each recipe.
- All nutritional values must be realistic.`;

  const model = await createGeminiModel(systemInstruction);

  const inputContext = {
    mandatory_ingredients: mandatoryIngredients.map((i) => ({
      name: i.name,
      risk_score: i.risk_score,
      item_key: i.item_key,
    })),
    user_profile: {
      allergies: userProfile.allergies,
      dietary: userProfile.dietary_preferences,
    },
    impact_context: {
      total_gbp_value: totalImpact.gbp.toFixed(2),
      total_co2_potential_kg: totalImpact.co2.toFixed(2),
    },
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Generate 3 Rescue Recipes for these assets: ${JSON.stringify(inputContext)}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            recipe_name: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            ingredients: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  quantity: { type: SchemaType.STRING },
                  prep_time: { type: SchemaType.STRING },
                  cook_time: { type: SchemaType.STRING },
                },
                required: ["name", "quantity"],
              },
            },
            instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            nutrition: {
              type: SchemaType.OBJECT,
              properties: {
                calories: { type: SchemaType.NUMBER },
                protein: { type: SchemaType.STRING },
                carbs: { type: SchemaType.STRING },
                fat: { type: SchemaType.STRING },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
            serving_size: { type: SchemaType.STRING },
            total_time: { type: SchemaType.STRING },
            missing_ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            safety_confirmation: { type: SchemaType.STRING },
          },
          required: ["recipe_name", "description", "serving_size", "total_time", "ingredients", "instructions", "nutrition", "missing_ingredients", "safety_confirmation"],
        },
      },
    },
  });

  const responseText = result.response.text();
  if (!responseText) throw new Error("Re:Plate Engine failed to return a response.");

  const parsedRecipes: any[] = JSON.parse(responseText);

  return parsedRecipes.map((recipe) => {
    let missingCost = 0;
    const missingIngredients = recipe.missing_ingredients || [];
    missingIngredients.forEach((ing: string) => {
      const key = Object.keys(FOOD_METRICS).find(
        (k) => ing.toLowerCase().includes(k.replace(/_/g, " ")) || k.replace(/_/g, " ").includes(ing.toLowerCase())
      );
      missingCost += key ? FOOD_METRICS[key].price_gbp : 1.25;
    });
    return {
      ...recipe,
      serving_size: recipe.serving_size || "2 servings",
      total_time: recipe.total_time || "30 min",
      ingredients: recipe.ingredients || [],
      missing_ingredients: missingIngredients,
      missing_ingredients_cost_gbp: Number(missingCost.toFixed(2)),
      impact: {
        gbp_saved: Number(totalImpact.gbp.toFixed(2)),
        co2_saved_kg: Number(totalImpact.co2.toFixed(2)),
      },
    };
  });
};

export const searchRecipesByPantry = async (
  ingredients: string[],
  userProfile: UserProfile
): Promise<Recipe[]> => {
  const systemInstruction = `You are the Re:Plate Pantry Finder. Your goal is to suggest high-quality meals based on the ingredients provided by the user. Adhere to safety profiles and write simple instructions for beginners.`;

  const model = await createGeminiModel(systemInstruction);

  const inputContext = {
    pantry_items: ingredients,
    user_profile: {
      allergies: userProfile.allergies,
      dietary: userProfile.dietary_preferences,
    },
  };

  const pantryImpact = ingredients.reduce(
    (acc, item) => {
      const data = findFoodMetric(item);
      if (data) {
        acc.gbp += data.price_gbp;
        acc.co2 += data.co2_kg;
      }
      return acc;
    },
    { gbp: 0, co2: 0 }
  );

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Find 3 meals for these pantry items: ${JSON.stringify(inputContext)}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            recipe_name: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            ingredients: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  quantity: { type: SchemaType.STRING },
                },
                required: ["name", "quantity"],
              },
            },
            instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            nutrition: {
              type: SchemaType.OBJECT,
              properties: {
                calories: { type: SchemaType.NUMBER },
                protein: { type: SchemaType.STRING },
                carbs: { type: SchemaType.STRING },
                fat: { type: SchemaType.STRING },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
            serving_size: { type: SchemaType.STRING },
            total_time: { type: SchemaType.STRING },
            missing_ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            safety_confirmation: { type: SchemaType.STRING },
          },
          required: ["recipe_name", "description", "serving_size", "total_time", "ingredients", "instructions", "nutrition", "missing_ingredients", "safety_confirmation"],
        },
      },
    },
  });

  const responseText = result.response.text();
  if (!responseText) throw new Error("Re:Plate Pantry Finder failed to return a response.");

  const parsedRecipes: any[] = JSON.parse(responseText);

  return parsedRecipes.map((recipe) => {
    const missingIngredients = recipe.missing_ingredients || [];
    return {
      ...recipe,
      serving_size: recipe.serving_size || "2 servings",
      total_time: recipe.total_time || "30 min",
      ingredients: recipe.ingredients || [],
      missing_ingredients: missingIngredients,
      missing_ingredients_cost_gbp: missingIngredients.length * 1.5,
      impact: {
        gbp_saved: Number(pantryImpact.gbp.toFixed(2)),
        co2_saved_kg: Number(pantryImpact.co2.toFixed(2)),
      },
    };
  });
};