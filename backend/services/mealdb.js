const { normalize } = require('../lib/normalizeRecipe');
const MEALDB_BASE_URL =
  process.env.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1';


// snags a meal's details from TheMealDB via ID
async function getMealDetailsById(idMeal) {
  const r = await fetch(
    `${MEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(idMeal)}`
  );
  if (!r.ok) throw new Error(`MealDB lookup failed: ${r.status}`);
  const data = await r.json();
  return (data && data.meals && data.meals[0]) || null;
}


// uses ALL ingredients in the CSV, aggregates results, normalizes, scores, sorts
async function searchMealsByIngredients(ingredientsCsv, limit = 5) {
  const list = ingredientsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return [];

  const foundMealsById = new Map();

  for (const ingredient of list) {
    try {
      const r = await fetch(
        `${MEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      if (!r.ok) {
        console.error(
          `MealDB filter failed for ingredient "${ingredient}":`,
          r.status
        );
        continue;
      }

      const data = await r.json();
      const meals = data?.meals || [];
      for (const m of meals) {
        if (!foundMealsById.has(m.idMeal)) {
          foundMealsById.set(m.idMeal, m);
        }
      }
    } catch (err) {
      console.error(
        `MealDB filter error for ingredient "${ingredient}":`,
        err.message
      );
      continue;
    }
  }

  if (foundMealsById.size === 0) return [];

  // snags detailed info for each unique meal
  const detailed = [];
  for (const [idMeal] of foundMealsById) {
    try {
      const full = await getMealDetailsById(idMeal);
      if (full) detailed.push(full);
      if (detailed.length >= Math.max(limit * 3, limit)) break;
    } catch {
    }
  }

  if (detailed.length === 0) return [];

  // normalizes using matchScore from normalize.fromMealDB
  const normalized = detailed.map((meal) =>
    normalize.fromMealDB(meal, list)
  );

  // sort by matchScore in a descending manner
  normalized.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  return normalized.slice(0, limit);
}

module.exports = { searchMealsByIngredients };
