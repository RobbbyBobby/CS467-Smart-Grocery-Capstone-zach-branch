const express = require('express');
const { authenticateToken } = require('../utils/authMiddleware.js');
const multer = require("multer");
const { getProductFromObj } = require('../services/objectRecognition.js');
const { getProductFromBarcode } = require('../services/barcodeRecognition.js');

const pool = require('../db');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const MS_PER_DAY = 1000 * 60 * 60 * 24;
function deriveState(item) {
    const currentState = item.state || "fresh";
    if (!item.expiryDate) return currentState;

    const expiry = new Date(item.expiryDate);
    if (isNaN(expiry.getTime())) return currentState;

    const diffDays = Math.ceil((expiry - new Date()) / MS_PER_DAY);
    if (diffDays < 0) return "expired";
    if (diffDays <= 5) return "nearing_expiration";
    return "fresh";
}

// This route is used to verify the user on page refresh
router.get('/me', authenticateToken, async (req, res) => {
    const jwtUser = req.user;

    const [rows] = await pool.execute(
        "SELECT userId, username, email FROM users WHERE userId = ?",
        [jwtUser.userId]
    );

    const user = rows[0];

    res.json({ user: user });
});

// --------------------------
// ITEMS TABLE ROUTES
// --------------------------

// GET all items by userId
router.get('/items/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    const [items] = await pool.execute(
        "SELECT * FROM items WHERE userId = ? AND itemQuantity > 0",
        [userId]
    );

    const withDerivedState = items.map(item => ({
        ...item,
        state: deriveState(item),
    }));

    res.json(withDerivedState);
});

// GET all items by state for userId (derived from expiry date)
router.get('/item-state/:userId/:state', authenticateToken, async (req, res) => {
    const userId = req.params.userId;
    const targetState = req.params.state;

    const [items] = await pool.execute(
        "SELECT * FROM items WHERE userId = ? AND itemQuantity > 0",
        [userId]
    );

    const filtered = items
        .map(item => {
            const derived = deriveState(item);
            return { ...item, state: derived };
        })
        .filter(item => item.state === targetState);

    res.json(filtered);
});

// GET all recent purchases by userId
router.get('/recent-purchases/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    const [items] = await pool.execute(
        `
        SELECT * FROM items WHERE userId = ? 
            AND createdAt >= (NOW() - INTERVAL 5 DAY)
        ORDER BY createdAt DESC
        `,
        [userId]
    );

    const withDerivedState = items.map(item => ({
        ...item,
        state: deriveState(item),
    }));

    res.json(withDerivedState);
});

// GET count of all item states by userId
router.get('/item-state-count/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    const [items] = await pool.execute(
        "SELECT * FROM items WHERE userId = ? AND itemQuantity > 0",
        [userId]
    );

    const defaultStates = {
        fresh: 0,
        nearing_expiration: 0,
    };

    items.forEach((item) => {
        const derived = deriveState(item);
        if (derived !== "expired" && defaultStates.hasOwnProperty(derived)) {
            defaultStates[derived] += 1;
        }
    });

    const stateArray = Object.entries(defaultStates).map(([state, count]) => ({
        state,
        count
    }));

    res.json(stateArray);
});

// EDIT item by item id
router.post('/item/:itemId', authenticateToken, async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.user.userId;
    const item = req.body.form;

    const [result] = await pool.execute(
        `
        UPDATE items 
        SET itemName = ?, purchaseDate = ?, expiryDate = ?, state = ?, units = ?
        WHERE itemId = ? AND userId = ?
        `,
        [item.itemName, item.purchaseDate, item.expiryDate, item.state, item.units, itemId, userId]
    );

    if (result.affectedRows === 0) {
        return res.status(403).json({ error: "Unauthorized or item not found" });
    }

    res.json(result);
});

// DELETE item by item id
router.delete('/item/:itemId', authenticateToken, async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.user.userId;

    const [result] = await pool.execute(
        `
        DELETE from items
        WHERE itemId = ? AND userId = ?
        `,
        [itemId, userId]
    );

    if (result.affectedRows === 0) {
        return res.status(403).json({ error: "Unauthorized or item not found" });
    }

    res.json(result);
});

// --------------------------
// END ITEMS TABLE ROUTES
// --------------------------

// --------------------------
// ITEM HISTORY TABLE ROUTES
// --------------------------

// GET item history by userId
router.get('/item-history/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    const [items] = await pool.execute(
        `
        SELECT
            items.itemName,
            items.itemId,
            itemHistory.action,
            itemHistory.quantityChange,
            itemHistory.actionDate
        FROM
            itemHistory
        INNER JOIN
            items ON itemHistory.itemId = items.itemId
        WHERE items.userId = ?
        ORDER BY itemHistory.actionDate DESC
        `,
        [userId]
    );

    res.json(items);
});

// CREATE item history by itemId
router.post('/item/:itemId/:action', authenticateToken, async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.user.userId;
    const item = req.body.form;

    let updatedQuantity = item.itemQuantity - item.quantityChange;

    const [updateItem] = await pool.execute(
        `
        UPDATE items 
        SET itemQuantity = ?
        WHERE itemId = ? AND userId = ?
        `,
        [updatedQuantity, itemId, userId]
    );

    if (updateItem.affectedRows === 0) {
        return res.status(403).json({ error: "Unauthorized or item not found" });
    }

    const [createHistory] = await pool.execute(
        `
        INSERT INTO itemHistory 
        SET userId = ?, itemId = ?, action = ?, quantityChange = ?
        `,
        [userId, itemId, item.action, item.quantityChange]
    );

    res.json(createHistory);
});

// --------------------------
// CATEGORIES TABLE ROUTES
// --------------------------

router.get("/categories", authenticateToken, async (req, res) => {
    const [categories] = await pool.execute("SELECT * FROM foodCategory");
    res.json(categories);
});

// This is an example of a route protected by the authentication middleware, only accessible to logged in users
router.get('/test', authenticateToken, (req, res) => {
    res.json({ email: req.user.email });
});

// Processes the image taken by the user
// This route was written with assistance from ChatGPT
// https://chatgpt.com/c/6921e80a-f350-8332-ad99-65a740af5b01
router.post("/process-image", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const imgType = req.body.imgType; // "barcode" or "object"
        const imageBuffer = req.file.buffer;

        const base64Image = imageBuffer.toString("base64");
        const mimeType = req.file.mimetype;
        const base64Url = `data:${mimeType};base64,${base64Image}`;

        let result;
        if (imgType === "barcode") {
            result = await getProductFromBarcode(base64Url);
        } else if (imgType === "object") {
            result = await getProductFromObj(base64Url);
        } else {
            return res.status(400).json({ error: "Invalid imgType" });
        }

        console.log("RESULT: ", result);

        const firstObject = result[0];
        const keys = Object.keys(firstObject);
        const firstKey = keys[0];

        if (firstKey && firstKey === "itemName") {
            res.json({ result }); // { result: [{ itemName: str, quantity: int, barcode: str }] }
        } else {
            throw new Error("Error procesing image.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image processing failed" });
    }
});

// Posts result to database after user confirmation (manual form)
router.post("/submit-food-item", authenticateToken, upload.none(), async (req, res) => {
    try {
        const userId = req.user.userId; // comes from JWT
        const data  = req.body;

        // Example req.body:
        // { itemName: "Savory snack mix",
        //   quantity: "1",
        //   units: "bag",
        //   category: "5",
        //   purchaseDate: "2025-11-25",
        //   barcode: "0016000126060" }

        const itemName = data.itemName?.trim();
        const itemQuantity = parseFloat(data.quantity) || 1;
        const units = data.units || null;
        const categoryId = data.categoryId
            ? parseInt(data.categoryId, 10)
            : data.category
            ? parseInt(data.category, 10)
            : null;
        const barcode = data.barcode || null;
        const state = "fresh";

        // purchaseDate can be empty; handle both
        // Preserve provided dates as YYYY-MM-DD strings to avoid timezone shifting to the prior day
        const purchaseDate = data.purchaseDate || null;

        let expiryDate = null;
        if (data.expiryDate) {
            const expDateObj = new Date(data.expiryDate);
            if (!isNaN(expDateObj.getTime())) {
                expiryDate = data.expiryDate;
            }
        }

        if (!itemName) {
            return res.status(400).json({ error: "itemName is required" });
        }

        const sql = `
            INSERT INTO items
                (userId, itemName, itemQuantity, categoryId, barcode, expiryDate, state, units, purchaseDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(sql, [
            userId,
            itemName,
            itemQuantity,
            categoryId,
            barcode,
            expiryDate,
            state,
            units,
            purchaseDate
        ]);

        return res.status(201).json({ success: true, message: "Item added." });
    } catch (err) {
        console.error("Error inserting manual item:", err);
        return res.status(500).json({ error: "Failed to insert item" });
    }
});


module.exports = router;
