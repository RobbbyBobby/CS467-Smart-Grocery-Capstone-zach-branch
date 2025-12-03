// frontend/src/pages/RecipesPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import config from "../../config";

type Recipe = {
  id: number;
  title: string;
  image: string;
  usedIngredients: string[];
  missedIngredients: string[];
  source: string;
  sourceUrl: string;
};

type RecipesResponse = {
  source: string;
  items: Recipe[];
};

type PantryItem = {
  itemId: number;
  itemName: string;
  itemQuantity?: number;
  state?: string;
  expiryDate?: string | null;
  units?: string | null;
};

type RecipesPageProps = {
  initialIngredients?: string[];
};

const BACKEND_URL = config.BACKEND_URL;

const RecipesPage: React.FC<RecipesPageProps> = ({ initialIngredients = [] }) => {
  const { user } = useAuth();

  const [ingredientsText, setIngredientsText] = useState(
    initialIngredients.join(", ")
  );
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [pantryLoading, setPantryLoading] = useState(false);
  const [pantryError, setPantryError] = useState<string | null>(null);
  const [userTypedIngredients, setUserTypedIngredients] = useState(false);

  // ---------------------------
  // Fetch pantry items from DB for logged-in user
  // ---------------------------
  useEffect(() => {
    const fetchPantryItems = async () => {
      if (!user) return; // wait until AuthContext has a user

      try {
        setPantryLoading(true);
        setPantryError(null);

        const res = await fetch(
          `${BACKEND_URL}/api/items/${user.userId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const items: PantryItem[] = Array.isArray(data)
          ? data
          : data.items ?? [];

        setPantryItems(items);

        // If user hasn't manually typed ingredients yet,
        // prefill with pantry item names.
        if (!userTypedIngredients && items.length > 0) {
          const names = items.map((i) => i.itemName).filter(Boolean);
          const joined = names.join(", ");
          setIngredientsText(joined);
          setIngredients(
            names.map((n) => n.trim()).filter((n) => n.length > 0)
          );
        }
      } catch (err) {
        console.error("Error fetching pantry items:", err);
        setPantryError("Failed to load pantry items from the server.");
        setPantryItems([]);
      } finally {
        setPantryLoading(false);
      }
    };

    void fetchPantryItems();
  }, [user, userTypedIngredients]);

  // ---------------------------
  // Fetch recipes based on ingredients
  // ---------------------------
  const fetchRecipes = async (ings: string[]) => {
    try {
      setLoading(true);
      setError(null);

      if (!ings || ings.length === 0) {
        setRecipes([]);
        setError("No ingredients provided.");
        return;
      }

      const ingredientsParam = encodeURIComponent(ings.join(","));
      const limit = 5;

      const res = await fetch(
        `${BACKEND_URL}/recipes?ingredients=${ingredientsParam}&limit=${limit}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: RecipesResponse = await res.json();
      setRecipes(json.items ?? []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes from server.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Whenever ingredients array changes, refetch recipes
  useEffect(() => {
    if (ingredients.length > 0) {
      void fetchRecipes(ingredients);
    }
  }, [ingredients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ingredientsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setIngredients(parsed);
  };

  const handleIngredientsChange = (value: string) => {
    setUserTypedIngredients(true);
    setIngredientsText(value);
  };

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Recipe Suggestions</h1>

      {/* Pantry items section */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Your Pantry Items (from DB)</h2>

        {pantryLoading && <p>Loading pantry items…</p>}

        {pantryError && !pantryLoading && (
          <p style={{ color: "red" }}>{pantryError}</p>
        )}

        {!pantryLoading && !pantryError && pantryItems.length === 0 && (
          <p>No pantry items found for your account.</p>
        )}

        {!pantryLoading && !pantryError && pantryItems.length > 0 && (
          <ul>
            {pantryItems.map((item) => (
              <li key={item.itemId}>
                <strong>{item.itemName}</strong>
                {item.itemQuantity !== undefined && item.units && (
                  <> — {item.itemQuantity} {item.units}</>
                )}
                {item.state && <> ({item.state})</>}
                {item.expiryDate && <> – expires {item.expiryDate}</>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ingredient search + recipes */}
      <section>
        <h2>Find Recipes by Ingredients</h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <label>
            Ingredients (comma-separated):{" "}
            <input
              type="text"
              value={ingredientsText}
              onChange={(e) => handleIngredientsChange(e.target.value)}
              placeholder="chicken, kale, garlic"
              style={{ minWidth: "300px" }}
            />
          </label>
          <button type="submit" style={{ marginLeft: "0.5rem" }}>
            Find Recipes
          </button>
        </form>

        {loading && <p>Loading recipes…</p>}

        {error && !loading && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {!loading && !error && ingredients.length > 0 && (
          <p>
            Showing {recipes.length} recipes for {ingredients.join(", ")}.
          </p>
        )}

        {!loading && !error && ingredients.length === 0 && (
          <p>Enter some ingredients to get recipe suggestions.</p>
        )}

        {!loading && !error && recipes.length === 0 && ingredients.length > 0 && (
          <p>No recipes found for those ingredients.</p>
        )}

        <section>
          {recipes.map((recipe) => (
            <article key={recipe.id}>
              <h3>{recipe.title}</h3>

              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{
                    maxWidth: "300px",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                />
              )}

              <div>
                <strong>Used ingredients:</strong>
                <ul>
                  {recipe.usedIngredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Missing ingredients:</strong>
                <ul>
                  {recipe.missedIngredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              <p>
                Source: {recipe.source.toUpperCase()} –{" "}
                <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                  View recipe
                </a>
              </p>

              <hr />
            </article>
          ))}
        </section>
      </section>
    </main>
  );
};

export default RecipesPage;
