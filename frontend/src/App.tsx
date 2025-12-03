import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header";

// Pages
import PantryDashboard from "./pages/PantryDashboard.jsx";
import AnalyticsDashboard from "./pages/AnalyticsDashboard.jsx";
import ItemUpload from "./pages/ItemUpload.jsx";
import PantryManagement from "./pages/PantryManagement.jsx";
import RecipesPage from "./pages/RecipesPage";

function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <Header />

        <main className="page-shell">
          <Routes>
            <Route path="/" element={<PantryDashboard />} />
            <Route path="/dashboard" element={<PantryDashboard />} />
            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
            <Route path="/manage" element={<PantryManagement />} />
            <Route path="/upload" element={<ItemUpload />} />
            <Route path="/recipes" element={<RecipesPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
