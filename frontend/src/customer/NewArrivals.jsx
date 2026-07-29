import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";

import { useFetch } from "../hooks/useFetch";
import { getNewArrivalsPage, getNewArrivalsCategories } from "../services/productService";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
];

export default function NewArrivals() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const { data: categories, loading: categoriesLoading } = useFetch(getNewArrivalsCategories, []);

  const { data: result, loading: productsLoading } = useFetch(
    () => getNewArrivalsPage({ page, pageSize: PAGE_SIZE, category, sort }),
    [page, category, sort]
  );

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      });
      if (resetPage) next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="px-[6vw] py-14">
      {/* header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Just Dropped</span>
        <h1 className="mt-2 font-serif text-[clamp(32px,4vw,46px)] font-medium">New Arrivals</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray">
          The latest silhouettes to join the atelier, freshest first.
        </p>
      </div>

      {/* category tabs */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2 border-b border-gold-soft pb-8">
        {categoriesLoading || !categories ? (
          <Loader variant="line" className="h-8 w-20 rounded-full" count={5} />
        ) : (
          <>
            <TabButton label="All" active={category === "all"} onClick={() => updateParams({ category: "all" })} />
            {categories.map((c) => (
              <TabButton
                key={c.id}
                label={c.name}
                active={category === c.slug}
                onClick={() => updateParams({ category: c.slug })}
              />
            ))}
          </>
        )}
      </div>

      {/* toolbar: result count + sort */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray">
          {productsLoading || !result ? "Loading…" : `${result.totalItems} new arrival${result.totalItems === 1 ? "" : "s"}`}
        </p>

        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray">
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </label>
      </div>

      {/* product grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
        {productsLoading || !result ? (
          <Loader variant="product" count={PAGE_SIZE} />
        ) : result.items.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="font-serif text-2xl">No new arrivals in this category yet.</p>
            <button
              type="button"
              onClick={() => updateParams({ category: "all" })}
              className="mt-4 text-sm uppercase tracking-widest text-gold underline"
            >
              View all new arrivals
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
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-xs uppercase tracking-widest transition ${
        active ? "border-maroon bg-maroon text-ivory" : "border-gold-soft text-gray hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}