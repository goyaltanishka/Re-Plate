import React, { useState, useEffect } from 'react';
import { UserProfile, Recipe } from '../types';
import { searchRecipesByPantry } from '../services/geminiService';

interface PantrySearchProps {
  userProfile: UserProfile;
}

const loadingMessages = [
  "Connecting to global recipe nodes...",
  "Filtering by Allergy Guard protocols...",
  "Optimizing for your diet...",
  "Compiling culinary logic...",
  "Finalizing ingredients..."
];

const PantrySearch: React.FC<PantrySearchProps> = ({ userProfile }) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async () => {
    const ingredients = ingredientInput.split(',').map(i => i.trim()).filter(i => i.length > 0);
    if (ingredients.length === 0) {
      setError("Please input at least one ingredient to initialize the search.");
      return;
    }
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    try {
      const results = await searchRecipesByPantry(ingredients, userProfile);
      setRecipes(results);
    } catch (err: any) {
      console.error("Error searching recipes:", err);
      setError(`Search Failure: ${err.message || 'The Engine is currently offline.'}`);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const goToNext = () => setCurrentIndex(i => Math.min(recipes.length - 1, i + 1));

  const recipe = recipes[currentIndex];

  return (
    <div className="space-y-12 pb-32">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-16 border border-slate-200 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=2070"
            alt="Pantry hero"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-grow space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
              </div>
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] font-heading">Pantry Finder</p>
            </div>
            <h3 className="text-5xl font-black text-white tracking-tighter font-heading italic">What's in your <br /> kitchen?</h3>
            <p className="text-slate-300 font-medium text-lg leading-relaxed">
              Unlock the hidden potential of your current stock. Enter your ingredients below and let the <span className="text-emerald-400 font-bold">AI Rescue Engine</span> craft a masterpiece.
            </p>

            <div className="relative group mt-10">
              <input
                className="w-full p-8 pl-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-500/40 focus:border-emerald-500 font-bold text-white shadow-2xl transition-all text-xl outline-none placeholder:text-slate-500"
                placeholder="Spinach, eggs, feta, pasta..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-emerald-500 rounded-full group-focus-within:h-12 transition-all"></div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-7 px-16 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 text-xl flex items-center gap-4 group"
            >
              {loading ? <i className="fa-solid fa-sync fa-spin"></i> : <i className="fa-solid fa-bolt-lightning group-hover:scale-125 transition-transform"></i>}
              FIND MEALS
            </button>
          </div>

          <div className="hidden lg:block w-80 h-80 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 p-8 rotate-3 shadow-2xl">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Scan</p>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-ping"></div>
                    <div className="h-2 bg-white/10 rounded-full flex-grow"></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic mt-12">
                "Mapping local ingredient clusters to global flavor profiles."
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-8 bg-rose-500/10 text-rose-500 rounded-[2.5rem] border border-rose-500/20 animate-in fade-in flex items-center gap-6 shadow-lg">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <span className="font-black tracking-tight text-lg">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-10">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
              <i className="fa-solid fa-microchip text-2xl animate-pulse"></i>
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tighter animate-pulse uppercase font-heading italic">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      )}

      {/* Slideshow */}
      {!loading && recipe && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">

          {/* Navigation bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm font-black text-slate-700 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-arrow-left"></i> Previous
            </button>

            {/* Dots */}
            <div className="flex items-center gap-3">
              {recipes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-8 h-3 bg-emerald-500'
                      : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={currentIndex === recipes.length - 1}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm font-black text-slate-700 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              Next <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Recipe counter */}
          <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
            Recipe {currentIndex + 1} of {recipes.length}
          </p>

          {/* Single recipe card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-[1.75rem] flex items-center justify-center text-emerald-600 shadow-lg ring-4 ring-white">
                  <i className="fa-solid fa-utensils text-xl"></i>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter font-heading italic leading-tight">{recipe.recipe_name}</h4>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-100 px-3 py-2 rounded-2xl">Serves {recipe.serving_size}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-100 px-3 py-2 rounded-2xl">Total: {recipe.total_time}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-8">{recipe.description}</p>

              <div className="space-y-8">
                {/* Instructions */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4 font-black">How to cook</p>
                  <div className="space-y-4 text-sm text-slate-600">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-black shadow-sm">{i + 1}</span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4 font-black">Ingredients</p>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-900">{ingredient.name}</span>
                          <span className="text-slate-500 text-[10px] uppercase tracking-[0.25em]">{ingredient.quantity}</span>
                        </div>
                        {(ingredient.prep_time || ingredient.cook_time) && (
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                            {ingredient.prep_time && <span className="bg-slate-100 px-2 py-1 rounded-full">Prep {ingredient.prep_time}</span>}
                            {ingredient.cook_time && <span className="bg-slate-100 px-2 py-1 rounded-full">Cook {ingredient.cook_time}</span>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4 font-black">Nutrition</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Calories', value: recipe.nutrition.calories },
                      { label: 'Protein', value: recipe.nutrition.protein },
                      { label: 'Carbs', value: recipe.nutrition.carbs },
                      { label: 'Fat', value: recipe.nutrition.fat },
                    ].map(n => (
                      <div key={n.label} className="rounded-2xl bg-white p-4 border border-slate-200 text-center">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-1">{n.label}</p>
                        <p className="font-black text-slate-900">{n.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing ingredients */}
                {recipe.missing_ingredients.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4 font-black">Missing Ingredients</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.missing_ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] font-black bg-white text-slate-800 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm uppercase tracking-wider">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety lock */}
                <div className="bg-slate-950 p-6 rounded-[2rem] text-white">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Safety Lock</p>
                  <p className="text-sm leading-relaxed text-slate-300">{recipe.safety_confirmation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm font-black text-slate-700 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-arrow-left"></i> Previous
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === recipes.length - 1}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm font-black text-slate-700 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              Next <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantrySearch;