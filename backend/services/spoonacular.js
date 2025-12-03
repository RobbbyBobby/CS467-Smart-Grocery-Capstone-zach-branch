const { normalize } = require('../lib/normalizeRecipe');

const BASE = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';
const ENDPOINT = '/recipes/findByIngredients';


async function callSpoonacularOnce(ingredients, limit, apiKey) {
  const url = new URL(ENDPOINT, BASE);
  url.searchParams.set('ingredients', ingredients);
  url.searchParams.set('number', String(limit));
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('ranking', '2');       
  url.searchParams.set('ignorePantry', 'true');

  console.log('[Spoonacular] Request URL:', url.toString());

  const res = await fetch(url);
  if (!res.ok) {
    console.error('[Spoonacular] Non-OK response:', res.status, res.statusText);
    throw new Error(`Spoonacular ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    console.warn('[Spoonacular] Unexpected response shape (not an array).');
    return [];
  }

  let normalized = data.map(normalize.fromSpoonacular);

  // sort by matchScore descending to align with MealDB scoring logic
  normalized.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  console.log('[Spoonacular] Normalized', normalized.length, 'recipes (sorted by matchScore)');
  return normalized;
}


// calls Spoonacular’s API with ingredients and returns a list of
// normalized recipes, sorted by matchScore. Retries once on failure. 
//thus the failsafe mechanisim is; call spoonacular -> retry spoonacular -> call MealDB -> retry MealDB
exports.findRecipesNormalized = async (ingredients, limit = 5) => {
  const apiKey =
    process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing SPOONACULAR_API_KEY (or SPOONACULAR_KEY) environment variable'
    );
  }

  console.log('[Spoonacular] Using API key starting with:', apiKey.slice(0, 5));
  console.log(
    '[Spoonacular] Fetching recipes for ingredients:',
    ingredients,
    'limit:',
    limit
  );

  let attempts = 0;
  const maxAttempts = 2; // 1 initial try + 1 retry if it doesnt work

  while (attempts < maxAttempts) {
    try {
      attempts += 1;
      console.log(`[Spoonacular] Attempt ${attempts} of ${maxAttempts}`);
      const result = await callSpoonacularOnce(ingredients, limit, apiKey);
      return result;
    } catch (err) {
      console.error(`[Spoonacular] Attempt ${attempts} failed:`, err.message);
      if (attempts >= maxAttempts) {
        console.error('[Spoonacular] All attempts failed, giving up.');
        throw err;
      }
      console.log('[Spoonacular] Retrying...');
    }
  }
};