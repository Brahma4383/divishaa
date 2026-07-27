import Rating from "./Rating";
import { useCart } from "../context/CartContext";

/**
 * @typedef {import("../types/home.js").Product} Product
 */

const BADGE_STYLES = {
  new: "bg-ink text-ivory",
  bestseller: "bg-gold text-ink",
  sale: "bg-maroon text-ivory",
};

const BADGE_LABEL = {
  new: "New",
  bestseller: "Bestseller",
  sale: null,
};

// Shown if product.image fails to load, instead of the browser's broken-image icon
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#F1EAE0"/><g fill="none" stroke="#AD8A54" stroke-width="1.4"><path d="M110 150 h80 v110 h-80 z"/><path d="M110 150 l40 -30 l40 30"/><circle cx="150" cy="120" r="8"/></g><text x="150" y="300" font-family="Georgia, serif" font-size="13" fill="#8A8175" text-anchor="middle">Image unavailable</text></svg>`
  );

/**
 * ProductCard
 * @param {{ product: Product, onQuickView?: (product: Product) => void, showBuyNow?: boolean }} props
 */
export default function ProductCard({ product, onQuickView, showBuyNow = false }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const isWishlisted = wishlist.has(product.id);
  const discountPct = product.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-ivory-deep">
        {product.badge && BADGE_LABEL[product.badge] && (
          <span className={`absolute left-3 top-3 z-10 px-2.5 py-1 text-[10px] uppercase tracking-wider ${BADGE_STYLES[product.badge]}`}>
            {BADGE_LABEL[product.badge]}
          </span>
        )}
        {discountPct !== null && (
          <span className="absolute bottom-3 right-3 z-10 bg-maroon px-2.5 py-1 text-[10px] uppercase tracking-wider text-ivory">
            {discountPct}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-ivory/90 transition hover:bg-ivory"
        >
          <svg
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            className={`h-4 w-4 ${isWishlisted ? "text-maroon" : "text-ink"}`}
          >
            <path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.3 5 5.6 5 8 5 10 6.6 12 9c2-2.4 4-4 6.4-4 3.3 0 5.1 3.4 3.6 6.9C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full gap-2 p-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0">
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="flex-1 border border-ink bg-ivory px-2 py-2.5 text-[11px] uppercase tracking-wider text-ink transition hover:bg-maroon hover:text-ivory hover:border-maroon"
          >
            Quick View
          </button>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="flex-1 bg-ink px-2 py-2.5 text-[11px] uppercase tracking-wider text-ivory transition hover:bg-maroon"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="pt-3.5">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-widest text-gold">{product.brand}</p>
        )}
        <h3 className="mt-1 text-[15px] font-medium text-ink">{product.name}</h3>
        <div className="mt-1.5">
          <Rating value={product.rating} reviewCount={product.reviewCount} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink">₹{product.price.toLocaleString("en-IN")}</span>
          {product.originalPrice && (
            <span className="text-[13px] text-gray-light line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {showBuyNow && (
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-2.5 w-full border border-ink py-2.5 text-[11px] uppercase tracking-wider text-ink transition hover:bg-ink hover:text-ivory"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
