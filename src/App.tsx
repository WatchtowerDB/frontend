import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { MainLayout } from "@/layout/MainLayout";
// import Home from './pages/Home';
import Dashboard from "@/pages/Dashboard/Dashboard";
import Compliance from "@/pages/Compliance/Compliance";
import Databases from "@/pages/Databases/Databases";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* All routes inside here will automatically have the Navbar */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/databases" element={<Databases />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

        {/* Routes OUTSIDE the layout (like a Login page) won't have the Navbar */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}
