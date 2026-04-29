import { MainLayout } from '@/layout/MainLayout'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
// import Home from './pages/Home';
import ComplianceLayout from '@/pages/compliance/ComplianceLayout'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Databases from '@/pages/Databases/Databases'
import { ThemeProvider } from './context/ThemeProvider'
import AssertionsPage from './pages/compliance/AssertionsPage'
import SummaryPage from './pages/compliance/SummaryPage'
import Login from './pages/login/Login'

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
              <Route path="assertions" element={<AssertionsPage />} />
            </Route>

            <Route path="/databases" element={<Databases />} />
            <Route path="/standards" element={<h2>Standards</h2>} />
            <Route path="/settings" element={<h2>Settings</h2>} />
            <Route path="/help" element={<h2>Help</h2>} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>

          {/* Routes OUTSIDE the layout (like a Login page) won't have the Navbar */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
