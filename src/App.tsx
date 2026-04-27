import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
// import Home from './pages/Home';
import Dashboard from "@/pages/dashboard/dashboard";
import ComplianceLayout from "@/pages/compliance/ComplianceLayout";
import Databases from "@/pages/Databases/Databases";
import SummaryPage from "./pages/compliance/SummaryPage";
import QueriesPage from "./pages/compliance/QueriesPage";
import { ThemeProvider } from "./context/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Compliance Route:*/}
            <Route path="compliance" element={<ComplianceLayout />}>
              {/* The Index Route: Renders at /compliance */}
              <Route index element={<SummaryPage />} />

              {/* The Sub-Route: Renders at /compliance/queries */}
              <Route path="queries" element={<QueriesPage />} />
            </Route>

            <Route path="/databases" element={<Databases />} />
            <Route path="/standards" element={<h2>Standards</h2>} />
            <Route path="/settings" element={<h2>Settings</h2>} />
            <Route path="/help" element={<h2>Help</h2>} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>

          {/* Routes OUTSIDE the layout (like a Login page) won't have the Navbar */}
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
