import { useState } from "react";

/**
 * SearchBar
 * Controlled search input. Calls onSearch(query) on submit so the parent
 * decides whether to hit `searchProducts()` from the service layer,
 * filter client-side, or navigate to a /search route.
 *
 * @param {{ onSearch: (query: string) => void, onClose?: () => void, placeholder?: string, autoFocus?: boolean }} props
 */
export default function SearchBar({ onSearch, onClose, placeholder = "Search for sarees, lehengas, gowns...", autoFocus = false }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-3 border-b border-ink pb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5 shrink-0 text-ink">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent font-serif text-xl text-ink placeholder:text-gray-light focus:outline-none md:text-2xl"
          aria-label="Search products"
        />
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-4 block text-xs uppercase tracking-widest text-gray hover:text-ink"
        >
          Close
        </button>
      )}
    </form>
  );
}
