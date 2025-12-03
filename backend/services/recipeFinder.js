const { findRecipesNormalized } = require('./spoonacular');
const { searchMealsByIngredients } = require('./mealdb');


// tries Spoonacular first; if that fails or returns nothing, falls back to MealDB.
// always returns an object: source, items
async function findRecipesUnified(ingredientsCsv, limit = 5) {
  console.log('[RecipeFinder] Incoming ingredients:', ingredientsCsv, 'limit:', limit);

  // tries Spoonacular first
  try {
    console.log('[RecipeFinder] Trying Spoonacular first...');
    const items = await findRecipesNormalized(ingredientsCsv, limit);
    const count = Array.isArray(items) ? items.length : 0;
    console.log('[RecipeFinder] Spoonacular returned', count, 'items');

    if (Array.isArray(items) && items.length) {
      return { source: 'spoonacular', items };
    } else {
      console.log('[RecipeFinder] Spoonacular returned no items, will try MealDB.');
    }
  } catch (e) {
    console.warn(
      'Spoonacular failed; falling back to TheMealDB:',
      e && e.message ? e.message : e
    );
  }

  
  // fallback option: TheMealDB
  try {
    console.log('[RecipeFinder] Calling MealDB fallback...');
    const items = await searchMealsByIngredients(ingredientsCsv, limit);
    const count = Array.isArray(items) ? items.length : 0;
    console.log('[RecipeFinder] MealDB returned', count, 'items');
    return { source: 'mealdb', items };
  } catch (e) {
    console.error(
      'TheMealDB failed:',
      e && e.message ? e.message : e
    );
    return { source: null, items: [] };
  }
}

module.exports = { findRecipesUnified };
