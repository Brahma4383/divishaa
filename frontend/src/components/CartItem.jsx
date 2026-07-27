/**
 * @typedef {import("../types/home.js").CartLine} CartLine
 */

/**
 * CartItem
 * @param {{ item: CartLine, onIncrement: () => void, onDecrement: () => void, onRemove: () => void }} props
 */
export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="flex gap-4 border-b border-ivory-deep py-4">
      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-16 shrink-0 rounded-sm object-cover"
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink">{item.name}</p>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
            className="text-gray-light transition hover:text-maroon"
          >
            ✕
          </button>
        </div>

        {(item.size || item.color) && (
          <p className="mt-0.5 text-xs text-gray">
            {[item.size, item.color].filter(Boolean).join(" / ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center border border-gold-soft">
            <button
              type="button"
              onClick={onDecrement}
              aria-label="Decrease quantity"
              className="px-2.5 py-1 text-ink transition hover:bg-ivory-deep"
            >
              −
            </button>
            <span className="min-w-[28px] text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label="Increase quantity"
              className="px-2.5 py-1 text-ink transition hover:bg-ivory-deep"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-ink">
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
