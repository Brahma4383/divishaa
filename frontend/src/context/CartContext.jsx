import { createContext, useContext, useMemo, useState, useCallback } from "react";

/**
 * @typedef {import("../types/home.js").Product} Product
 * @typedef {import("../types/home.js").CartLine} CartLine
 */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  /** @type {[CartLine[], Function]} */
  const [cartLines, setCartLines] = useState([]);
  /** @type {[Set<string>, Function]} */
  const [wishlist, setWishlist] = useState(() => new Set());
  const [isCartOpen, setCartOpen] = useState(false);

  /** @param {Product} product */
  const addToCart = useCallback((product, { size, color, quantity = 1 } = {}) => {
    setCartLines((prev) => {
      const lineId = `${product.id}-${size || "onesize"}-${color || "default"}`;
      const existing = prev.find((line) => line.id === lineId);
      if (existing) {
        return prev.map((line) => (line.id === lineId ? { ...line, quantity: line.quantity + quantity } : line));
      }
      return [
        ...prev,
        { id: lineId, productId: product.id, name: product.name, image: product.image, price: product.price, quantity, size, color },
      ];
    });
  }, []);

  const removeFromCart = useCallback((lineId) => {
    setCartLines((prev) => prev.filter((line) => line.id !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId, quantity) => {
    setCartLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, quantity: Math.max(1, quantity) } : line))
    );
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  }, []);

  const cartCount = useMemo(() => cartLines.reduce((sum, line) => sum + line.quantity, 0), [cartLines]);
  const cartTotal = useMemo(() => cartLines.reduce((sum, line) => sum + line.quantity * line.price, 0), [cartLines]);

  const value = {
    cartLines,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    wishlist,
    wishlistCount: wishlist.size,
    toggleWishlist,
    isCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
