import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

import { useFetch } from "../hooks/useFetch";
import { getShopProducts, getShopFilterOptions } from "../services/productService";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
];

const RATING_OPTIONS = [0, 4, 4.5];

export default function Shope() {
  const { slug } = useParams(); // present when routed via /category/:slug
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ---- derive current filter state from the URL (source of truth) ----
  const category = slug || searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "featured";
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("q") || "";
  const minRating = Number(searchParams.get("rating")) || 0;
  const selectedBrands = useMemo(
    () => (searchParams.get("brands") ? searchParams.get("brands").split(",") : []),
    [searchParams]
  );
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  const { data: filterOptions, loading: filtersLoading } = useFetch(getShopFilterOptions, []);

  const { data: result, loading: productsLoading } = useFetch(
    () =>
      getShopProducts({
        page,
        pageSize: PAGE_SIZE,
        category,
        brands: selectedBrands,
        minPrice,
        maxPrice,
        minRating,
        sort,
        search,
      }),
    [page, category, selectedBrands.join(","), minPrice, maxPrice, minRating, sort, search]
  );

  // ---- helpers that patch the URL (and always reset to page 1 on filter change) ----
  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
          next.delete(key);
        } else {
          next.set(key, Array.isArray(value) ? value.join(",") : String(value));
        }
      });
      if (resetPage) next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const toggleBrand = (brand) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    updateParams({ brands: next });
  };

  const clearAllFilters = () => setSearchParams(search ? { q: search } : {});

  const activeFilterCount =
    (category !== "all" ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0) + (minPrice || maxPrice ? 1 : 0);

  // If we arrived via /category/:slug, keep the URL's "category" param in sync
  // so filter-clearing and pagination links behave consistently either way.
  useEffect(() => {
    if (slug && searchParams.get("category") !== slug) {
      const next = new URLSearchParams(searchParams);
      next.set("category", slug);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="px-[6vw] py-14">
      {/* header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
          {search ? `Results for "${search}"` : "Full Catalogue"}
        </span>
        <h1 className="mt-2 font-serif text-[clamp(32px,4vw,46px)] font-medium">
          {category !== "all" && filterOptions
            ? filterOptions.categories.find((c) => c.slug === category)?.name || "Shop"
            : "Shop All"}
        </h1>
      </div>

      {/* search bar */}
      <div className="mx-auto mb-10 max-w-lg">
        <SearchBar
          placeholder="Search within the shop..."
          onSearch={(q) => updateParams({ q })}
        />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ---------------- FILTER PANEL (desktop) ---------------- */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterPanel
              filterOptions={filterOptions}
              filtersLoading={filtersLoading}
              category={category}
              selectedBrands={selectedBrands}
              minRating={minRating}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={(slugValue) => updateParams({ category: slugValue })}
              onToggleBrand={toggleBrand}
              onRatingChange={(r) => updateParams({ rating: r || null })}
              onPriceChange={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
              onClear={clearAllFilters}
            />
          </div>
        </aside>

        {/* ---------------- MAIN COLUMN ---------------- */}
        <div className="flex-1">
          {/* toolbar: mobile filter toggle + result count + sort */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-gold-soft pb-5">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 border border-ink px-4 py-2.5 text-xs uppercase tracking-widest transition hover:bg-ink hover:text-ivory lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              Filters {activeFilterCount > 0 && <span className="text-maroon">({activeFilterCount})</span>}
            </button>

            <p className="text-sm text-gray">
              {productsLoading || !result ? "Loading…" : `${result.totalItems} product${result.totalItems === 1 ? "" : "s"}`}
            </p>

            <label className="relative ml-auto flex items-center gap-2 text-xs uppercase tracking-widest text-gray">
              Sort by
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="appearance-none border border-gold-soft bg-ivory py-2 pl-3 pr-8 text-ink focus:border-ink focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </label>
          </div>

          {/* active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {category !== "all" && (
                <Chip label={filterOptions?.categories.find((c) => c.slug === category)?.name || category} onRemove={() => updateParams({ category: "all" })} />
              )}
              {selectedBrands.map((b) => (
                <Chip key={b} label={b} onRemove={() => toggleBrand(b)} />
              ))}
              {minRating > 0 && <Chip label={`${minRating}★ & up`} onRemove={() => updateParams({ rating: null })} />}
              {(minPrice || maxPrice) && (
                <Chip label={`₹${minPrice || 0} – ₹${maxPrice || filterOptions?.maxPrice || ""}`} onRemove={() => updateParams({ minPrice: null, maxPrice: null })} />
              )}
              <button type="button" onClick={clearAllFilters} className="text-xs uppercase tracking-widest text-maroon underline">
                Clear all
              </button>
            </div>
          )}

          {/* product grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
            {productsLoading || !result ? (
              <Loader variant="product" count={PAGE_SIZE} />
            ) : result.items.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="font-serif text-2xl">No products match these filters.</p>
                <button type="button" onClick={clearAllFilters} className="mt-4 text-sm uppercase tracking-widest text-gold underline">
                  Clear filters
                </button>
              </div>
            ) : (
              result.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => window.alert(`Quick View — ${p.name}`)}
                />
              ))
            )}
          </div>

          {result && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onPageChange={(p) => updateParams({ page: p }, { resetPage: false })}
            />
          )}
        </div>
      </div>

      {/* ---------------- FILTER DRAWER (mobile) ---------------- */}
      <div
        className={`fixed inset-0 z-[90] bg-ink/40 transition-opacity duration-300 lg:hidden ${
          mobileFiltersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileFiltersOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-[95] h-full w-[min(320px,86vw)] overflow-y-auto bg-ivory p-6 pt-8 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium">Filters</h2>
          <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="text-xl">
            ✕
          </button>
        </div>
        <FilterPanel
          filterOptions={filterOptions}
          filtersLoading={filtersLoading}
          category={category}
          selectedBrands={selectedBrands}
          minRating={minRating}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryChange={(slugValue) => updateParams({ category: slugValue })}
          onToggleBrand={toggleBrand}
          onRatingChange={(r) => updateParams({ rating: r || null })}
          onPriceChange={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
          onClear={clearAllFilters}
        />
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="mt-8 w-full bg-ink py-3 text-xs uppercase tracking-widest text-ivory"
        >
          Show Results
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FilterPanel — shared by the desktop sidebar and the mobile drawer   */
/* ------------------------------------------------------------------ */

function FilterPanel({
  filterOptions,
  filtersLoading,
  category,
  selectedBrands,
  minRating,
  minPrice,
  maxPrice,
  onCategoryChange,
  onToggleBrand,
  onRatingChange,
  onPriceChange,
  onClear,
}) {
  if (filtersLoading || !filterOptions) {
    return (
      <div className="space-y-3 border border-gold-soft bg-white p-6">
        <Loader variant="line" className="h-4 w-1/2" count={6} />
      </div>
    );
  }

  return (
    <div className="border border-gold-soft bg-white p-6 text-sm">
      {/* category */}
      <div className="pb-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Category</h3>
        <ul className="space-y-1">
          <li>
            <CategoryOption label="All Categories" active={category === "all"} onClick={() => onCategoryChange("all")} />
          </li>
          {filterOptions.categories.map((c) => (
            <li key={c.id}>
              <CategoryOption label={c.name} active={category === c.slug} onClick={() => onCategoryChange(c.slug)} />
            </li>
          ))}
        </ul>
      </div>

      {/* brand */}
      <div className="border-t border-ivory-deep py-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Brand</h3>
        <ul className="max-h-52 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#D8C9A8_transparent]">
          {filterOptions.brands.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] text-ink transition hover:bg-ivory-deep/60">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                  className="h-3.5 w-3.5 accent-[#6E2430]"
                />
                <span className={selectedBrands.includes(brand) ? "font-medium text-maroon" : ""}>{brand}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* price */}
      <div className="border-t border-ivory-deep py-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Price</h3>
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          bounds={{ min: filterOptions.minPrice, max: filterOptions.maxPrice }}
          onApply={onPriceChange}
        />
      </div>

      {/* rating */}
      <div className="border-t border-ivory-deep pt-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Rating</h3>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRatingChange(r)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                minRating === r
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-gold-soft text-gray hover:border-ink hover:text-ink"
              }`}
            >
              {r === 0 ? "Any" : `${r}★ & up`}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 w-full border-t border-ivory-deep pt-5 text-center text-xs uppercase tracking-widest text-gold underline underline-offset-2 hover:text-maroon"
      >
        Clear all filters
      </button>
    </div>
  );
}

function CategoryOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-[13px] transition ${
        active ? "bg-maroon/[0.07] font-medium text-maroon" : "text-gray hover:bg-ivory-deep/60 hover:text-ink"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full transition ${active ? "bg-maroon" : "bg-transparent"}`} />
      {label}
    </button>
  );
}

function PriceFilter({ minPrice, maxPrice, bounds, onApply }) {
  const [min, setMin] = useState(minPrice ?? "");
  const [max, setMax] = useState(maxPrice ?? "");

  // keep local inputs in sync if the filter gets cleared elsewhere (e.g. chip "✕" or "Clear all")
  useEffect(() => {
    setMin(minPrice ?? "");
    setMax(maxPrice ?? "");
  }, [minPrice, maxPrice]);

  const apply = () => onApply(min || undefined, max || undefined);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-light">₹</span>
          <input
            type="number"
            min={0}
            placeholder={String(bounds.min)}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full border border-gold-soft bg-ivory py-2 pl-6 pr-2 text-xs focus:border-ink focus:outline-none"
            aria-label="Minimum price"
          />
        </div>
        <span className="text-gray-light">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-light">₹</span>
          <input
            type="number"
            min={0}
            placeholder={String(bounds.max)}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full border border-gold-soft bg-ivory py-2 pl-6 pr-2 text-xs focus:border-ink focus:outline-none"
            aria-label="Maximum price"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={apply}
        className="mt-3 w-full border border-ink py-2 text-[11px] uppercase tracking-widest text-ink transition hover:bg-ink hover:text-ivory"
      >
        Apply
      </button>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-gold-soft bg-white py-1.5 pl-3.5 pr-2 text-xs text-ink shadow-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-gray-light transition hover:bg-maroon hover:text-ivory"
      >
        ✕
      </button>
    </span>
  );
}