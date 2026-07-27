import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import { useCart } from "../context/CartContext";

/**
 * Sidebar
 * Slide-in mini-cart drawer. Reads/writes straight from CartContext so it
 * can be mounted once (in MainLayout) and toggled from anywhere (Navbar).
 */
export default function Sidebar() {
  const { isCartOpen, closeCart, cartLines, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-ink/40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[95] flex h-full w-[min(400px,90vw)] flex-col bg-ivory shadow-2xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isCartOpen}
      >
        <div className="flex items-center justify-between border-b border-gold-soft px-6 py-5">
          <h2 className="font-serif text-xl font-medium">Your Bag ({cartCount})</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="text-xl text-ink">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {cartLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray">
              <p className="text-sm">Your bag is empty.</p>
              <Link to="/shop" onClick={closeCart} className="text-xs uppercase tracking-widest text-gold underline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartLines.map((line) => (
              <CartItem
                key={line.id}
                item={line}
                onIncrement={() => updateQuantity(line.id, line.quantity + 1)}
                onDecrement={() => updateQuantity(line.id, line.quantity - 1)}
                onRemove={() => removeFromCart(line.id)}
              />
            ))
          )}
        </div>

        {cartLines.length > 0 && (
          <div className="border-t border-gold-soft px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-gray">Subtotal</span>
              <span className="font-semibold text-ink">₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <button
              type="button"
              className="w-full bg-ink py-3.5 text-xs uppercase tracking-widest text-ivory transition hover:bg-maroon"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
