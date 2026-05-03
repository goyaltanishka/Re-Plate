# Re:Plate 🌿

> **Predictive Kitchen Intelligence** — Reduce food waste, rescue ingredients, and eat smarter.

**Live Demo:** [replate-peach.vercel.app](https://replate-peach.vercel.app)  
**GitHub:** [github.com/goyaltanishka/Re-Plate](https://github.com/goyaltanishka/Re-Plate)

---

## What is Re:Plate?

Re:Plate is an AI-powered food waste reduction platform. It helps households track their pantry, rescue expiring ingredients with AI-generated recipes, and connect with their local community — all while tracking their real-world environmental and financial impact.

---

## Features

### 🏠 Overview Dashboard
A real-time snapshot of your kitchen's health. Displays:
- **Rescue Priority** — ingredients in the critical "red zone" (expiring very soon)
- **Watch List** — items approaching their use-by date
- **CO2 Offset** — kilograms of carbon emissions prevented through food rescue
- **Value Reboot** — money saved by not throwing food away
- A **Sustainability Graph** showing daily rescued vs. at-risk items
- **Kitchen Efficiency** score based on your pantry activity

### 🥫 My Pantry
Your personal ingredient tracker — the "Active Stock Ledger." You add ingredients with their shelf life (in days), and Re:Plate monitors their risk level over time. Columns include:
- **Ingredient Asset** — what the item is
- **Remaining** — days left before expiry
- **Multivariate Risk** — an AI-calculated score combining shelf life, quantity, and usage patterns
- **Logic Status** — whether the item is safe, at risk, or in the red zone
- **Action** — what Re:Plate recommends you do with it

When typing an ingredient, the app uses AI-assisted autocomplete that suggests "Did you mean…?" to normalise spelling and match items to its internal food database.

### 🍳 Rescue Recipes
Powered by the **EcoPulse Engine v2.1**. When items in your pantry hit high risk, this feature generates 3 AI-crafted recipes that **must** use those ingredients. Each recipe includes:
- Step-by-step beginner-friendly instructions
- Full ingredient list with quantities and prep/cook times
- Nutritional breakdown (calories, protein, carbs, fat)
- Missing ingredients and their estimated cost
- A **Safety Lock** confirmation that the recipe respects your allergies and dietary preferences
- Environmental impact: CO2 saved and money rescued

### 🔍 Meal Finder
A freeform pantry search tool. Type any ingredients you have (e.g. `spinach, eggs, feta`) and the AI Rescue Engine returns 3 tailored meal ideas — even if those items aren't in your tracked pantry.

### 👥 Community
**Mesh Authentication** system. You can:
- Create a community group or join one using a **Neighbour Access Key** (e.g. `EP-X942`)
- Connect with nearby peers to share food insights and posts
- Donate food directly to a **community food shelter** (coming soon)

Users with more Re:Plate Tokens are considered more trusted within the community, incentivising genuine participation.

### 📊 My Impact
Your personal **Eco Ledger** — a breakdown of your Re:Plate Tokens and environmental contribution.

**Token Earning Rules:**
| Action | Tokens |
|---|---|
| Sign Up Bonus | +50 RT |
| Community Post | +25 RT |
| Referral Success | +50 RT |

**Refer a Neighbour:** Generate a unique invite code and share it. Both you and your peer receive +50 RT once they accept and join. Tokens are only awarded after the peer accepts — not just when you send the invite.

The **Eco Status** panel converts your tokens into a real-world CO2 equivalent (e.g. 100 RT = 42.0 kg of CO2 offset across the network).

**Achievement Ledger** — Digital badges you unlock through activity:
- 🌱 **Seedling** — Started the journey
- 🦸 **Rescue Hero** — 5 items rescued
- 🌍 **Eco Giant** — 10 community posts
- 👨‍🍳 **Master Chef** — 5 AI recipes made

### 🛡️ Safety Filter (Allergy Guard + Dietary Logic)
A persistent sidebar filter that tells the AI what to avoid in every recipe it generates.

**Allergy Guard:** Peanuts, Tree Nuts, Dairy, Gluten, Eggs, Shellfish

**Dietary Logic:** Vegetarian, Vegan, Halal, Kosher

These filters are applied globally — every recipe generated via Rescue Recipes or Meal Finder will automatically exclude flagged ingredients.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| AI / Recipes | Google Gemini API (`gemini-2.0-flash`) |
| In-Browser Runtime | BrowserPod (WebAssembly) |
| Deployment | Vercel |
| Build Tool | Vite |

---

## How the AI Works

Re:Plate uses the **Google Gemini API** for two core functions:

**1. Rescue Recipes** — Takes your high-risk pantry items and generates exactly 3 recipes that must use all of them. The prompt enforces beginner-friendly instructions, allergy safety, and includes estimated CO2 and financial impact per recipe.

**2. Meal Finder** — Takes a freeform list of ingredients and finds 3 suitable meals, again respecting your full safety profile.

Both functions use structured JSON output via Gemini's `responseSchema` feature, so the app always receives clean, typed recipe data it can render directly without any parsing errors.

The model selection is dynamic — the app queries the Gemini API for available models and picks the best one from a priority list: `gemini-2.0-flash` → `gemini-2.0-flash-lite` → `gemini-1.5-pro` → `gemini-1.5-flash`.

The **"Did you mean…?" ingredient autocomplete** works by normalising ingredient names (stripping spaces, punctuation, and case differences) and fuzzy-matching them against a local food metrics database (`FOOD_METRICS`), which also stores per-ingredient CO2 values and GBP prices used in the impact calculations.

---

## How BrowserPod Works

Re:Plate uses **BrowserPod** (by Leaning Technologies) as a client-side execution layer.

### What is BrowserPod?
Normally, a web app needs a backend server running somewhere in the cloud to handle logic, process data, and call APIs. BrowserPod eliminates that requirement entirely.

BrowserPod runs a **real Node.js environment compiled to WebAssembly** directly inside the user's browser tab. Think of it as a tiny Linux computer running invisibly inside the browser window. This is called a **Pod**.

### What does that mean for Re:Plate?
When you open Re:Plate in your browser:
1. BrowserPod boots a Pod inside your tab using your BrowserPod API key
2. That Pod runs a virtual Node.js environment entirely client-side — no cloud server is provisioned
3. Re:Plate's backend logic executes inside this Pod, on your own machine, inside your browser
4. The Pod is **ephemeral** — it exists only while the tab is open and is destroyed when you close or reload it

### Why does BrowserPod need an API key?
The API key authenticates your app with BrowserPod's service so it can boot the WebAssembly runtime, track usage, and enforce limits. BrowserPod offers 1,000 free compute hours per month on the free tier.

### How does this interact with Vercel?
Vercel hosts the **static frontend** (the HTML, CSS and JavaScript bundle). When a user visits the site:
- Vercel delivers the app files
- BrowserPod boots inside the user's browser tab
- Gemini API calls are made directly from within that Pod

There is no traditional backend server. The full stack runs in the browser after that initial file delivery.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GEMINI_API_KEY` | Google Gemini API — powers AI recipe generation |
| `VITE_BROWSERPOD_API_KEY` | BrowserPod API — boots the in-browser Node.js runtime |

These are stored in `.env.local` on your local machine and entered manually in the Vercel dashboard for production. They are never committed to GitHub.

---

## Getting Started (Local Development)

```bash
# Clone the repo
git clone https://github.com/goyaltanishka/Re-Plate.git
cd Re-Plate/Replate-1

# Install dependencies
npm install

# Add your API keys
# Create a .env.local file with:
# VITE_GEMINI_API_KEY=your_key_here
# VITE_BROWSERPOD_API_KEY=your_key_here

# Run locally
npm run dev
```

---

## Deployment

This project is deployed on **Vercel**. To deploy your own fork:

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add `VITE_GEMINI_API_KEY` and `VITE_BROWSERPOD_API_KEY` as environment variables in the Vercel project settings
4. Deploy — Vercel handles the build automatically on every push to main

---

## Roadmap

- [ ] Community Food Shelter — donate surplus food to local shelters directly through the app
- [ ] Barcode scanning for pantry input
- [ ] Push notifications for red-zone items
- [ ] Expanded token economy with leaderboards and trust tiers

