// this func converts input into a clean array & splits CSV strs into trimmed data
function toList(x) {
  if (Array.isArray(x)) return x;
  if (typeof x === 'string') {
    return x
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}


// this func normalizes queries to lowercase 
function normalizeQuery(query) {
  return toList(query).map((s) => s.toLowerCase());
}


// this func collects ingrident fields
function extractMealDbIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const v = meal[`strIngredient${i}`];
    if (v && v.trim()) out.push(v.trim().toLowerCase());
  }
  return out;
}


exports.normalize = {
  fromSpoonacular: (r) => {
    const usedIngredients = Array.isArray(r.usedIngredients)
      ? r.usedIngredients
          .map((i) => String(i.name || '').trim().toLowerCase())
          .filter(Boolean)
      : [];

    const missedIngredients = Array.isArray(r.missedIngredients)
      ? r.missedIngredients
          .map((i) => String(i.name || '').trim().toLowerCase())
          .filter(Boolean)
      : [];

    const matchScore = usedIngredients.length - missedIngredients.length;

    return {
      id: Number(r.id),
      title: r.title,
      image: r.image || null,
      usedIngredients,
      missedIngredients,
      source: 'spoonacular',
      sourceUrl: r.sourceUrl || r.spoonacularSourceUrl || null,
      matchScore,
    };
  },


  // MealDB 
  // NOTE: queryIngredients can be array or CSV str
  fromMealDB: (m, queryIngredients) => {
    const ing = extractMealDbIngredients(m); // ingredients are lowercase
    const q = normalizeQuery(queryIngredients); 
    let usedIngredients = [];
    let missedIngredients = [];

    if (q.length) {
      const ingSet = new Set(ing);
      usedIngredients = q.filter((x) => ingSet.has(x));
      missedIngredients = q.filter((x) => !ingSet.has(x));
    }

    const matchScore = usedIngredients.length - missedIngredients.length;

    return {
      id: Number(m.idMeal),
      title: m.strMeal,
      image: m.strMealThumb || null,
      usedIngredients,
      missedIngredients,
      source: 'mealdb',
      sourceUrl: m.strSource || m.strYoutube || null,
      matchScore,
    };
  },
};


// Export Helpers if Needed 
exports.toList = toList;
exports.normalizeQuery = normalizeQuery;
exports.extractMealDbIngredients = extractMealDbIngredients;
