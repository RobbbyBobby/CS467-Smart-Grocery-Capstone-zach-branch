require('dotenv').config();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET
const { generateAccessToken, generateRefreshToken, REFRESH_SECRET } = require('./utils/tokenMiddleware.js');

//const authRoutes = require('./routes/authRoutes.js');
//const protectedRoutes = require('./routes/protectedRoutes.js');

// DB ROUTES
const authRoutes = require('./routes/authRoutes.js');
const protectedRoutes = require('./routes/protectedRoutes.js');
const recipesRoutes = require('./routes/recipesRoutes.js');
const categoriesRoutes = require('./routes/categoriesRoutes.js');
const itemsRoutes = require('./routes/itemRoutes.js');
const usersRoutes = require('./routes/userRoutes.js');
const historyRoutes = require('./routes/historyRoutes.js');

// -------------------------------
// EXPRESS APP
// -------------------------------
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        // Can substitute this in the env file on deployment
        origin: 'http://localhost:5173',
        credentials: true,
}));

// Registers all routes to be available from the /api/... route
app.use('/api', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api', recipesRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', itemsRoutes);
app.use('/api', usersRoutes);
app.use('/api', historyRoutes);

// -------------------------------
// DATABASE CONNECTION
// -------------------------------
const pool = require('./db');

// quick health ping (for testing purposes)
app.get('/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

///recipes router
const recipesRouter = require('./routes/recipes');
app.use('/recipes', recipesRouter);

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
