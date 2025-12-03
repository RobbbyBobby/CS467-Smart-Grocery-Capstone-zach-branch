// -------------------------------
// FOOD CATEGORY TABLE
// -------------------------------
app.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    const sql = "INSERT INTO foodCategory (name) VALUES (?)";
    const [result] = await pool.execute(sql, [name]);

    res.json({ message: "Category created", categoryId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/categories", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM foodCategory");
  res.json(rows);
});

// -------------------------------
// IMAGES TABLE
// -------------------------------
app.post("/images", async (req, res) => {
  try {
    const {
      userId,
      itemName,
      itemQty,
      categoryId,
      barcode,
      expiryDate,
      imageURL,
    } = req.body;

    const sql = `
      INSERT INTO images 
      (userId, itemName, itemQty, categoryId, barcode, expiryDate, imageURL)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      userId,
      itemName,
      itemQty,
      categoryId,
      barcode,
      expiryDate,
      imageURL,
    ]);

    res.json({ message: "Image added", imageId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// PANTRY TABLE
// -------------------------------
app.post("/pantry", async (req, res) => {
  try {
    const { userId, imageId, state, currentQty } = req.body;

    const sql = `
      INSERT INTO pantry (userId, imageId, state, currentQty)
      VALUES (?, ?, ?, ?)
    `;
    await pool.execute(sql, [userId, imageId, state, currentQty]);

    res.json({ message: "Pantry entry added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/pantry", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM pantry");
  res.json(rows);
});

// -------------------------------
// RECIPES TABLE
// -------------------------------
app.post("/recipes", async (req, res) => {
  try {
    const { userId, sourceDomain, sourceURL } = req.body;

    const sql = `
      INSERT INTO recipes (userId, sourceDomain, sourceURL)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      userId,
      sourceDomain,
      sourceURL,
    ]);

    res.json({ message: "Recipe saved", recipeId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/recipes", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM recipes");
  res.json(rows);
});

// -------------------------------
// PANTRY HISTORY TABLE
// -------------------------------
app.post("/pantryHist", async (req, res) => {
  try {
    const { userId, imageId, action, qtyChange } = req.body;

    const sql = `
      INSERT INTO pantryHist (userId, imageId, action, qtyChange)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      userId,
      imageId,
      action,
      qtyChange,
    ]);

    res.json({ message: "History logged", histId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/pantryHist", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM pantryHist");
  res.json(rows);
});