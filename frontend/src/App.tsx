import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";

// Components
import Header from "./components/Header";

// Pages
import Home from "./pages/Home.jsx";
import PantryDashboard from "./pages/PantryDashboard.jsx";
import AnalyticsDashboard from "./pages/AnalyticsDashboard.jsx";
import ItemUpload from "./pages/ItemUpload.jsx";
import PantryManagement from "./pages/PantryManagement.jsx";
import RecipesPage from "./pages/RecipesPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Home />;
  return <>{children}</>;
}

function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <BrowserRouter>
        <Header />

        <main className="page-shell">
          <Routes>
            <Route path="/" element={user ? <PantryDashboard /> : <Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PantryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics-dashboard"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <ProtectedRoute>
                  <PantryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <ItemUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <RecipesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
