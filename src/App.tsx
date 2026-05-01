import { MainLayout } from "@/layout/MainLayout"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
// import Home from './pages/Home';
import ComplianceLayout from "@/pages/compliance/ComplianceLayout"
import Dashboard from "@/pages/dashboard/Dashboard"
import Databases from "@/pages/databases/Databases"
import { AuthProvider } from "./context/AuthProvider"
import { ProtectedRoute } from "./context/ProtectedRoute"
import { ThemeProvider } from "./context/ThemeProvider"
import AssertionsPage from "./pages/compliance/AssertionsPage"
import SummaryPage from "./pages/compliance/SummaryPage"
import Login from "./pages/login/Login"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />

                {/* Compliance Route:*/}
                <Route path="compliance" element={<ComplianceLayout />}>
                  {/* Redirect /compliance and /compliance/ to /compliance/summary */}
                  <Route index element={<Navigate to="summary" replace />} />

                  {/* The Sub-Route: Renders at /compliance/summary */}
                  <Route path="summary" element={<SummaryPage />} />

                  {/* The Sub-Route: Renders at /compliance/queries */}
                  <Route path="assertions" element={<AssertionsPage />} />
                </Route>

                <Route path="/databases" element={<Databases />} />
                <Route path="/standards" element={<h2>Standards</h2>} />
                <Route path="/settings" element={<h2>Settings</h2>} />
                <Route path="/help" element={<h2>Help</h2>} />
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              </Route>
            </Route>

            {/* Routes OUTSIDE the layout (like a Login page) won't have the Navbar */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
