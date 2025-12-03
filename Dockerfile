# ---------- Stage 1: Build frontend ----------
FROM node:22 AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---------- Stage 2: Build backend ----------
FROM node:22

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --productionsas

# Copy backend source
COPY backend/ .

# Copy frontend build output into backend/public
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 5000
CMD ["node", "app.js"]
