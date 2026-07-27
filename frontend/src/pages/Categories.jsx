import { useNavigate } from "react-router-dom";

import CategoryCard from "../components/CategoryCard";
import Loader from "../components/Loader";

import { useFetch } from "../hooks/useFetch";
import { getCategories } from "../services/productService";

export default function Categories() {
  const navigate = useNavigate();
  const { data: categories, loading } = useFetch(getCategories, []);

  return (
    <div className="px-[6vw] py-16">
      {/* header */}
      <div className="mb-14 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Explore</span>
        <h1 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">Shop by Category</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray">
          From everyday staples to occasion wear — find your edit.
        </p>
      </div>

      {/* category grid */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {loading || !categories ? (
          <Loader variant="category" count={6} />
        ) : (
          <>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={(c) => navigate(`/category/${c.slug}`)}
              />
            ))}

            {/* "Shop All" tile, styled a little differently so it reads as the catch-all option */}
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="group relative flex aspect-[3/4.2] w-full flex-col items-center justify-center gap-2 border border-gold-soft bg-white text-center transition hover:border-ink"
            >
              <span className="font-serif text-2xl font-medium text-ink">Shop All</span>
              <span className="text-xs uppercase tracking-widest text-gold transition group-hover:text-maroon">
                View Full Catalogue →
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}