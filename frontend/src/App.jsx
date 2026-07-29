import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./customer/Home";
import Shope from "./customer/Shope";
import NewArrivals from "./customer/NewArrivals";
import Categories from "./customer/Categories";
import Login from "./auth/Login";
import Register from "./auth/Register";
import VendorDashboard from "./vendor/VendorDashboard";

function VendorOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("authUser") || "null");
  const token = localStorage.getItem("authToken");
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "vendor" && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function CustomerHome() {
  const user = JSON.parse(localStorage.getItem("authUser") || "null");
  return user?.role === "vendor" || user?.role === "admin" ? <Navigate to="/vendor" replace /> : <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/shop" element={<Shope />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<Shope />} />
          <Route path="/search" element={<Shope />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Route>

        {/* Auth pages — outside MainLayout so no Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor" element={<VendorOnly><VendorDashboard /></VendorOnly>} />
      </Routes>
    </BrowserRouter>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="text-xs uppercase tracking-[0.28em] text-gold">
        Divishaa.couture
      </span>
      <h1 className="font-serif text-3xl font-medium text-ink">{title}</h1>
      <p className="text-sm text-gray">
        This page is being tailored. Check back soon.
      </p>
    </div>
  );
}
