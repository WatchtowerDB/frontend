import { MainLayout } from "@/layout/MainLayout"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
// import Home from './pages/Home';
import ComplianceLayout from "@/pages/compliance/ComplianceLayout"
import Dashboard from "@/pages/dashboard/Dashboard"
import ClientDBPage from "@/pages/databases/ClientDBPage"
import DatabasesLayout from "@/pages/databases/DatabasesLayout"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "./components/ui/sonner"
import { AuthProvider } from "./context/AuthProvider"
import { ProtectedRoute } from "./context/ProtectedRoute"
import { ThemeProvider } from "./context/ThemeProvider"
import AssertionsPage from "./pages/compliance/AssertionsPage"
import SummaryPage from "./pages/compliance/SummaryPage"
import Login from "./pages/login/Login"
import NotFound from "./pages/not-found/NotFound"

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes and TODO: Make sure i dont have staleTime otherwhere.
        retry: 1,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
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

                  <Route path="databases" element={<DatabasesLayout />}>
                    {/* Redirect /databases and /databases/ to /databases/clientdbs */}
                    <Route index element={<Navigate to="clientdbs" replace />} />

                    <Route path="clientdbs" element={<ClientDBPage />} />

                    <Route path="schemas" element={<h2>Schemas</h2>} />
                  </Route>
                  <Route path="/standards" element={<h2>Standards</h2>} />
                  <Route path="/settings" element={<h2>Settings</h2>} />
                  <Route path="/help" element={<h2>Help</h2>} />
                  {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                </Route>
              </Route>

              {/* Routes OUTSIDE the layout (like a Login page) won't have the Navbar */}
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
