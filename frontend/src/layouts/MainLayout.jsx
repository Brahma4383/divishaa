import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { CartProvider } from "../context/CartContext";

/**
 * MainLayout
 * Shared shell for every route: sticky Navbar, the cart Sidebar drawer,
 * the routed page content (<Outlet />), and the Footer.
 * CartProvider lives here so cart/wishlist state survives navigation
 * between pages, not just within a single page.
 */
export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-ivory text-ink">
        <Navbar onSearch={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)} />
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
