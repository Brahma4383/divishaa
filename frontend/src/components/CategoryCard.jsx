/**
 * @typedef {import("../types/home.js").Category} Category
 */

/**
 * CategoryCard
 * @param {{ category: Category, onSelect?: (category: Category) => void }} props
 */
export default function CategoryCard({ category, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      className="group relative aspect-[3/4.2] w-full overflow-hidden rounded-sm text-left shadow-[0_10px_30px_-18px_rgba(27,23,19,0.4)] transition-shadow hover:shadow-[0_20px_44px_-18px_rgba(27,23,19,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
    >
      <img
        src={category.image}
        alt={`${category.name} category`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
      <span className="absolute bottom-4 left-4 z-10 text-ivory">
        <span className="block font-serif text-xl font-semibold">{category.name}</span>
        <span className="mt-0.5 block text-[11px] uppercase tracking-widest text-gold-soft">
          {category.productCount} Products
        </span>
      </span>
    </button>
  );
}
