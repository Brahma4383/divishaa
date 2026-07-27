import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Men", to: "/category/men" },
  { label: "Women", to: "/category/women" },
  { label: "Kids", to: "/category/kids" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Categories", to: "/categories" },
];

/**
 * Navbar
 * @param {{ onSearch?: (query: string) => void }} props
 */
export default function Navbar({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlistCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between border-b border-gold-soft bg-ivory/90 backdrop-blur-md transition-[padding] duration-300 ${
          scrolled ? "px-[6vw] py-2.5" : "px-[6vw] py-[18px]"
        }`}
      >
        <NavLink to="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-semibold tracking-wide">Divishaa</span>
          <span className="mt-0.5 text-[11px] tracking-[0.35em] text-gold">.couture</span>
        </NavLink>

        <div className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative py-1.5 text-[13px] font-medium uppercase tracking-wider transition after:absolute after:bottom-0 after:left-0 after:h-px after:bg-maroon after:transition-all ${
                  isActive ? "text-maroon after:w-full" : "text-ink after:w-0 hover:after:w-full"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="h-[22px] w-[22px] text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button type="button" aria-label="Wishlist" className="relative h-[22px] w-[22px] text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.3 5 5.6 5 8 5 10 6.6 12 9c2-2.4 4-4 6.4-4 3.3 0 5.1 3.4 3.6 6.9C19.5 16.4 12 21 12 21z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] text-ivory">
                {wishlistCount}
              </span>
            )}
          </button>

          <button type="button" onClick={openCart} aria-label="Cart" className="relative h-[22px] w-[22px] text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] text-ivory">
                {cartCount}
              </span>
            )}
          </button>

          <NavLink
            to="/login"
            className="hidden border border-ink px-[22px] py-2.5 text-xs uppercase tracking-wider transition hover:bg-ink hover:text-ivory md:block"
          >
            Login / Register
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex w-[26px] flex-col gap-1.5 md:hidden"
          >
            <span className="h-[1.5px] w-full bg-ink" />
            <span className="h-[1.5px] w-full bg-ink" />
            <span className="h-[1.5px] w-full bg-ink" />
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed right-0 top-0 z-[70] flex h-full w-[min(320px,84vw)] flex-col gap-6 bg-ivory p-8 pt-24 shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className="text-base uppercase tracking-wider"
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/login" onClick={() => setMobileOpen(false)} className="border border-ink py-3 text-center text-xs uppercase tracking-wider">
          Login / Register
        </NavLink>
      </div>

      {/* search overlay */}
      <div
        className={`fixed inset-0 z-[80] flex items-start justify-center bg-ink/55 pt-[14vh] transition-opacity duration-300 ${
          searchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="w-[min(560px,88vw)] border-t-2 border-gold bg-ivory p-9">
          <SearchBar onSearch={(q) => { onSearch?.(q); setSearchOpen(false); }} onClose={() => setSearchOpen(false)} autoFocus={searchOpen} />
        </div>
      </div>
    </>
  );
}
