import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import Banner from "../components/Banner";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";

import { useFetch } from "../hooks/useFetch";
import {
  getHeroSlides,
  getCategories,
  getTrendingProducts,
  getNewArrivals,
  getBestSellers,
  getBrands,
  getReviews,
} from "../services/productService";

const TRENDING_PAGE_SIZE = 8;

export default function Home() {
  const navigate = useNavigate();
  const [trendingPage, setTrendingPage] = useState(1);

  const { data: slides } = useFetch(getHeroSlides, []);
  const { data: categories, loading: categoriesLoading } = useFetch(getCategories, []);
  const { data: trending, loading: trendingLoading } = useFetch(
    () => getTrendingProducts({ page: trendingPage, pageSize: TRENDING_PAGE_SIZE }),
    [trendingPage]
  );
  const { data: newArrivals, loading: arrivalsLoading } = useFetch(getNewArrivals, []);
  const { data: bestSellers, loading: bestSellersLoading } = useFetch(getBestSellers, []);
  const { data: brands, loading: brandsLoading } = useFetch(getBrands, []);
  const { data: reviews, loading: reviewsLoading } = useFetch(getReviews, []);

  const handleQuickView = useCallback((product) => {
    // Placeholder: swap for a real modal/drawer once the product detail view exists.
    window.alert(`Quick View — ${product.name}\n\nFull product detail (size, color, description) would open here.`);
  }, []);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    setNewsletterMessage("Thank you — you're on the list for new arrivals & offers.");
    setNewsletterEmail("");
  }

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <Banner
        slides={slides || []}
        onShopNow={() => navigate("/shop")}
        onExplore={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* ---------------- CATEGORIES ---------------- */}
      <section id="categories" className="relative px-[6vw] py-24">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Curated Edits</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {categoriesLoading || !categories ? (
            <Loader variant="category" count={6} />
          ) : (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={(c) => navigate(`/category/${c.slug}`)}
              />
            ))
          )}
        </div>
      </section>

      {/* ---------------- TRENDING DRESSES ---------------- */}
      <section className="bg-white px-[6vw] py-24">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">This Week</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">Trending Dresses</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
          {trendingLoading || !trending ? (
            <Loader variant="product" count={TRENDING_PAGE_SIZE} />
          ) : (
            trending.items.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
            ))
          )}
        </div>
        {trending && (
          <Pagination page={trending.page} totalPages={trending.totalPages} onPageChange={setTrendingPage} />
        )}
      </section>

      {/* ---------------- NEW ARRIVALS ---------------- */}
      <section id="new-arrivals" className="px-[6vw] py-24">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Just Dropped</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">New Arrivals</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {arrivalsLoading || !newArrivals ? (
            <Loader variant="product" count={4} />
          ) : (
            newArrivals.map((product) => (
              <div key={product.id} className="w-[250px] shrink-0">
                <ProductCard product={product} onQuickView={handleQuickView} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---------------- BEST SELLERS ---------------- */}
      <section className="bg-white px-[6vw] py-24">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Loved by Many</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">Best Sellers</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
          {bestSellersLoading || !bestSellers ? (
            <Loader variant="product" count={4} />
          ) : (
            bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={handleQuickView} showBuyNow />
            ))
          )}
        </div>
      </section>

      {/* ---------------- BRANDS ---------------- */}
      <section className="px-[6vw] py-16">
        <div className="mb-10 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">In House &amp; Beyond</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">Our Brands</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4">
          {brandsLoading || !brands ? (
            <Loader variant="line" className="h-6 w-24" count={6} />
          ) : (
            brands.map((brand) => (
              <span
                key={brand.id}
                className="font-serif text-2xl font-medium text-gray transition hover:scale-105 hover:text-ink"
              >
                {brand.name}
              </span>
            ))
          )}
        </div>
      </section>

      {/* ---------------- REVIEWS ---------------- */}
      <section className="bg-white px-[6vw] py-24">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Testimonials</span>
          <h2 className="mt-2 font-serif text-[clamp(32px,4vw,48px)] font-medium">What Our Customers Say</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reviewsLoading || !reviews ? (
            <Loader variant="spinner" />
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="w-[320px] shrink-0 border border-gold-soft bg-white p-8">
                <div className="mb-3.5 flex items-center gap-3.5">
                  <img src={review.customerImage} alt={review.customerName} className="h-[52px] w-[52px] rounded-full object-cover" />
                  <div>
                    <p className="text-[15px] font-medium">{review.customerName}</p>
                    <p className="text-[13px] text-gold">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  </div>
                </div>
                <p className="text-sm italic leading-7 text-[#4a453f]">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-3.5 text-[11px] uppercase tracking-widest text-gold">
                  Purchased: {review.purchasedProduct}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="bg-gradient-to-br from-ink via-[#2b241d] to-maroon px-[6vw] py-24 text-center text-ivory">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold-soft">Stay In Touch</span>
        <h2 className="mt-2 font-serif text-[clamp(30px,4vw,44px)] font-medium">Subscribe to our Newsletter</h2>
        <p className="mx-auto mb-9 mt-3.5 max-w-md text-[15px] text-gray-light">
          Get updates about offers, discounts, and new arrivals — straight from the atelier.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="mx-auto flex max-w-md border-b border-gold-soft">
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            className="flex-1 bg-transparent px-1.5 py-3.5 text-sm text-ivory placeholder:text-gray-light focus:outline-none"
          />
          <button type="submit" className="px-2 py-3.5 text-xs font-medium uppercase tracking-widest text-gold-soft">
            Subscribe
          </button>
        </form>
        <p className="mt-3.5 min-h-[16px] text-xs tracking-wide text-gold-soft">{newsletterMessage}</p>
      </section>
    </>
  );
}
