/**
 * productService.js
 *
 * Home-page data is now fetched from the Django customer endpoint.
 * The view returns the same shape that the UI expects, so the React
 * components do not need to change.
 */

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed.');
  }
  return response.json();
}

async function fetchHomeData() {
  return fetchJson('/customer/home/');
}

export async function getProducts() {
  const data = await fetchJson('/customer/products/');
  return data.products || [];
}

export async function createProduct(payload) {
  return fetchJson('/customer/products/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(productId, payload) {
  return fetchJson(`/customer/products/${productId}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId) {
  return fetchJson(`/customer/products/${productId}/`, {
    method: 'DELETE',
  });
}

/* ---------------------------------- data ---------------------------------- */

const CATEGORIES = [
  { id: "cat-women", name: "Women", slug: "women", productCount: 482, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" },
  { id: "cat-men", name: "Men", slug: "men", productCount: 356, image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&auto=format&fit=crop" },
  { id: "cat-kids", name: "Kids", slug: "kids", productCount: 190, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop" },
  { id: "cat-shoes", name: "Shoes", slug: "shoes", productCount: 214, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop" },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", productCount: 128, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=600&auto=format&fit=crop" },
  { id: "cat-bags", name: "Bags", slug: "bags", productCount: 97, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
];

const TRENDING = [
  { id: "p1", category: "women", brand: "Divishaa Label", name: "Emerald Draped Saree Gown", price: 6499, originalPrice: 9999, rating: 4.8, reviewCount: 212, badge: "sale", image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=600&auto=format&fit=crop" },
  { id: "p2", category: "women", brand: "Roadster", name: "Ivory Wrap Midi Dress", price: 2199, originalPrice: 3499, rating: 4.5, reviewCount: 154, badge: "sale", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
  { id: "p3", category: "women", brand: "Zara", name: "Beige Tailored Blazer Dress", price: 3899, originalPrice: 5299, rating: 4.6, reviewCount: 98, badge: "sale", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600&auto=format&fit=crop" },
  { id: "p4", category: "women", brand: "Allen Solly", name: "Charcoal Knit Bodycon", price: 1899, originalPrice: 2599, rating: 4.3, reviewCount: 76, badge: "sale", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop" },
  { id: "p5", category: "women", brand: "Divishaa Label", name: "Gold Thread Lehenga Set", price: 12999, originalPrice: 17999, rating: 4.9, reviewCount: 301, badge: "sale", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
  { id: "p6", category: "women", brand: "H&M", name: "Floral Chiffon Maxi Dress", price: 2699, originalPrice: 3999, rating: 4.4, reviewCount: 120, badge: "sale", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop" },
  { id: "p7", category: "women", brand: "AJIO", name: "Rust Satin Slip Dress", price: 1799, originalPrice: 2499, rating: 4.2, reviewCount: 64, badge: "sale", image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=600&auto=format&fit=crop" },
  { id: "p8", category: "women", brand: "Zara", name: "Black Tiered Ruffle Gown", price: 4599, originalPrice: 6299, rating: 4.7, reviewCount: 187, badge: "sale", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop" },
];

const NEW_ARRIVALS = [
  { id: "n1", category: "women", brand: "Divishaa Label", name: "Sage Linen Co-ord Set", price: 2299, rating: 4.6, badge: "new", image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=500&auto=format&fit=crop" },
  { id: "n2", category: "women", brand: "Zara", name: "Champagne Satin Slip", price: 1999, rating: 4.4, badge: "new", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=500&auto=format&fit=crop" },
  { id: "n3", category: "women", brand: "AJIO", name: "Terracotta Wrap Kurta", price: 1699, rating: 4.5, badge: "new", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=500&auto=format&fit=crop" },
  { id: "n4", category: "women", brand: "Divishaa Label", name: "Ivory Organza Cape", price: 3499, rating: 4.8, badge: "new", image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=500&auto=format&fit=crop" },
  { id: "n5", category: "women", brand: "H&M", name: "Mustard Pleated Skirt", price: 1499, rating: 4.3, badge: "new", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=500&auto=format&fit=crop" },
  { id: "n6", category: "men", brand: "Roadster", name: "Onyx Velvet Blazer", price: 3999, rating: 4.7, badge: "new", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop" },
];

// Full New Arrivals catalogue — used by the dedicated /new-arrivals page (the
// home page slider above only shows a curated 6). `daysAgo` drives the
// "Newest" sort so it isn't just re-shuffling identically-badged items.
const NEW_ARRIVALS_FULL = [
  { id: "na1", category: "women", brand: "Divishaa Label", name: "Sage Linen Co-ord Set", price: 2299, rating: 4.6, badge: "new", daysAgo: 1, image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=500&auto=format&fit=crop" },
  { id: "na2", category: "men", brand: "Roadster", name: "Onyx Velvet Blazer", price: 3999, rating: 4.7, badge: "new", daysAgo: 1, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop" },
  { id: "na3", category: "women", brand: "Zara", name: "Champagne Satin Slip", price: 1999, rating: 4.4, badge: "new", daysAgo: 2, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=500&auto=format&fit=crop" },
  { id: "na4", category: "kids", brand: "Zara Kids", name: "Denim Dungaree Set", price: 1299, originalPrice: 1799, rating: 4.3, reviewCount: 21, badge: "new", daysAgo: 2, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop" },
  { id: "na5", category: "women", brand: "AJIO", name: "Terracotta Wrap Kurta", price: 1699, rating: 4.5, badge: "new", daysAgo: 3, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=500&auto=format&fit=crop" },
  { id: "na6", category: "shoes", brand: "Nike", name: "Air Runner Sneakers", price: 4499, originalPrice: 5999, rating: 4.7, reviewCount: 210, badge: "new", daysAgo: 3, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
  { id: "na7", category: "women", brand: "Divishaa Label", name: "Ivory Organza Cape", price: 3499, rating: 4.8, badge: "new", daysAgo: 4, image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=500&auto=format&fit=crop" },
  { id: "na8", category: "accessories", brand: "Divishaa Label", name: "Antique Gold Jhumkas", price: 1499, rating: 4.9, reviewCount: 145, badge: "new", daysAgo: 4, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop" },
  { id: "na9", category: "men", brand: "Adidas", name: "Track Jacket", price: 3299, originalPrice: 4299, rating: 4.6, reviewCount: 91, badge: "new", daysAgo: 5, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop" },
  { id: "na10", category: "women", brand: "H&M", name: "Mustard Pleated Skirt", price: 1499, rating: 4.3, badge: "new", daysAgo: 5, image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=500&auto=format&fit=crop" },
  { id: "na11", category: "bags", brand: "Divishaa Label", name: "Hand-Beaded Potli Bag", price: 2499, originalPrice: 3299, rating: 4.7, reviewCount: 52, badge: "new", daysAgo: 6, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
  { id: "na12", category: "kids", brand: "H&M Kids", name: "Printed Cotton Frock", price: 999, rating: 4.5, reviewCount: 33, badge: "new", daysAgo: 6, image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop" },
  { id: "na13", category: "shoes", brand: "Divishaa Label", name: "Hand-Embroidered Juttis", price: 1999, rating: 4.8, reviewCount: 84, badge: "new", daysAgo: 7, image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop" },
  { id: "na14", category: "men", brand: "Allen Solly", name: "Classic Fit Chinos", price: 2199, rating: 4.5, reviewCount: 42, badge: "new", daysAgo: 7, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop" },
  { id: "na15", category: "accessories", brand: "Zara", name: "Silk Printed Scarf", price: 899, rating: 4.4, reviewCount: 29, badge: "new", daysAgo: 8, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop" },
  { id: "na16", category: "women", brand: "Roadster", name: "Ivory Wrap Midi Dress", price: 2199, originalPrice: 3499, rating: 4.5, reviewCount: 154, badge: "new", daysAgo: 8, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
];

const BEST_SELLERS = [
  { id: "b1", category: "women", brand: "Divishaa Label", name: "Signature Zari Border Saree", price: 8499, rating: 4.9, badge: "bestseller", image: "https://images.unsplash.com/photo-1583391733981-8b3f2d6f5a2e?q=80&w=600&auto=format&fit=crop" },
  { id: "b2", category: "men", brand: "Nike", name: "Classic Everyday Joggers", price: 2499, rating: 4.6, badge: "bestseller", image: "https://images.unsplash.com/photo-1552902019-ebcd97aa9aa0?q=80&w=600&auto=format&fit=crop" },
  { id: "b3", category: "men", brand: "Levis", name: "High Rise Straight Denim", price: 3299, rating: 4.5, badge: "bestseller", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop" },
  { id: "b4", category: "women", brand: "Puma", name: "Studio Sculpt Crop Set", price: 1999, rating: 4.4, badge: "bestseller", image: "https://images.unsplash.com/photo-1600185365483-26d7b3d5c7a1?q=80&w=600&auto=format&fit=crop" },
];

// Extra catalogue so every category on the Shop page (not just Women) has products.
const MORE_PRODUCTS = [
  { id: "m1", category: "men", brand: "Levis", name: "Slim Fit Cotton Shirt", price: 1899, originalPrice: 2599, rating: 4.4, reviewCount: 58, badge: "sale", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop" },
  { id: "m2", category: "men", brand: "Allen Solly", name: "Classic Fit Chinos", price: 2199, rating: 4.5, reviewCount: 42, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop" },
  { id: "m3", category: "men", brand: "Adidas", name: "Track Jacket", price: 3299, originalPrice: 4299, rating: 4.6, reviewCount: 91, badge: "sale", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop" },
  { id: "k1", category: "kids", brand: "H&M Kids", name: "Printed Cotton Frock", price: 999, rating: 4.5, reviewCount: 33, image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop" },
  { id: "k2", category: "kids", brand: "Zara Kids", name: "Denim Dungaree Set", price: 1299, originalPrice: 1799, rating: 4.3, reviewCount: 21, badge: "sale", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop" },
  { id: "s1", category: "shoes", brand: "Nike", name: "Air Runner Sneakers", price: 4499, originalPrice: 5999, rating: 4.7, reviewCount: 210, badge: "sale", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
  { id: "s2", category: "shoes", brand: "Puma", name: "Casual Slip-On", price: 2299, rating: 4.3, reviewCount: 67, image: "https://images.unsplash.com/photo-1600185365483-26d7b3d5c7a1?q=80&w=600&auto=format&fit=crop" },
  { id: "s3", category: "shoes", brand: "Divishaa Label", name: "Hand-Embroidered Juttis", price: 1999, rating: 4.8, reviewCount: 84, badge: "bestseller", image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop" },
  { id: "ac1", category: "accessories", brand: "Divishaa Label", name: "Antique Gold Jhumkas", price: 1499, rating: 4.9, reviewCount: 145, badge: "bestseller", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop" },
  { id: "ac2", category: "accessories", brand: "Zara", name: "Silk Printed Scarf", price: 899, rating: 4.4, reviewCount: 29, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop" },
  { id: "bg1", category: "bags", brand: "Divishaa Label", name: "Hand-Beaded Potli Bag", price: 2499, originalPrice: 3299, rating: 4.7, reviewCount: 52, badge: "sale", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop" },
  { id: "bg2", category: "bags", brand: "AJIO", name: "Structured Tote Bag", price: 1799, rating: 4.2, reviewCount: 38, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop" },
];

const BRANDS = [
  { id: "br1", name: "Nike" }, { id: "br2", name: "Adidas" }, { id: "br3", name: "Puma" },
  { id: "br4", name: "Levis" }, { id: "br5", name: "Zara" }, { id: "br6", name: "H&M" },
  { id: "br7", name: "Roadster" }, { id: "br8", name: "Allen Solly" }, { id: "br9", name: "Divishaa Label" },
];

const REVIEWS = [
  { id: "r1", customerName: "Ananya R.", rating: 5, purchasedProduct: "Gold Thread Lehenga Set", text: "The embroidery detail is beyond anything I expected online. Felt truly custom-made.", customerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" },
  { id: "r2", customerName: "Meera K.", rating: 5, purchasedProduct: "Emerald Draped Saree Gown", text: "Fit like a dream and the fabric quality is genuinely premium. Worth every rupee.", customerImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150&auto=format&fit=crop" },
  { id: "r3", customerName: "Priya S.", rating: 4, purchasedProduct: "Ivory Organza Cape", text: "Delivery was quick and the packaging alone felt like a luxury unboxing experience.", customerImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=150&auto=format&fit=crop" },
  { id: "r4", customerName: "Riya D.", rating: 5, purchasedProduct: "Onyx Velvet Blazer", text: "Compliments every time I wear it. The tailoring is sharp and the fit is flawless.", customerImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop" },
];

const HERO_SLIDES = [
  { id: "h1", eyebrow: "Summer Couture Edit", title: "New Summer Collection", highlight: "Collection", subtitle: "Up to 50% off handcrafted silhouettes. Discover the season's most coveted drapes.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop", ctaPrimary: "Shop Now", ctaSecondary: "Explore Collection" },
  { id: "h2", eyebrow: "Evening Wear", title: "Draped in Elegance", highlight: "Elegance", subtitle: "Limited edition eveningwear, hand-finished with gold thread embroidery.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop", ctaPrimary: "Shop Now", ctaSecondary: "Explore Collection" },
  { id: "h3", eyebrow: "Bridal Couture", title: "The Wedding Edit", highlight: "Edit", subtitle: "Bespoke bridal ensembles crafted for your most memorable day.", image: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?q=80&w=1600&auto=format&fit=crop", ctaPrimary: "Shop Now", ctaSecondary: "Explore Collection" },
];

// Full catalogue used by the Shop page — combines every section's products
// (with a Map keyed by id, so if the same product appears in more than one
// section it isn't duplicated) plus MORE_PRODUCTS for category coverage.
const ALL_PRODUCTS = Array.from(
  new Map([...TRENDING, ...NEW_ARRIVALS, ...BEST_SELLERS, ...MORE_PRODUCTS].map((p) => [p.id, p])).values()
);

/* --------------------------------- helpers --------------------------------- */

function paginate(items, page = 1, pageSize = 8) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

/* --------------------------------- API ------------------------------------ */

export async function getHeroSlides() {
  const data = await fetchHomeData();
  return data.slides || [];
}

export async function getCategories() {
  const data = await fetchHomeData();
  return data.categories || [];
}

/** @param {{page?: number, pageSize?: number, query?: string}} [params] */
export async function getTrendingProducts(params = {}) {
  const data = await fetchHomeData();
  const { page = 1, pageSize = 8 } = params;
  const items = data.trending?.items || [];
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export async function getNewArrivals() {
  const data = await fetchHomeData();
  return data.newArrivals || [];
}

export async function getBestSellers() {
  const data = await fetchHomeData();
  return data.bestSellers || [];
}

export async function getBrands() {
  const data = await fetchHomeData();
  return data.brands || [];
}

export async function getReviews() {
  const data = await fetchHomeData();
  return data.reviews || [];
}

/** @param {string} query */
export async function searchProducts(query) {
  await wait(DELAY);
  if (!query) return [];
  const q = query.toLowerCase();
  return ALL_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
}

/**
 * getShopProducts — the Shop page's main data call: filter, sort, then paginate
 * the full catalogue. Every argument is optional; call with no params to get
 * page 1 of everything, newest-ish order.
 *
 * @param {import("../types/home.js").ShopQuery} [query]
 * @returns {Promise<import("../types/home.js").PaginatedResponse>}
 */
export async function getShopProducts(query = {}) {
  await wait(DELAY);
  const {
    page = 1,
    pageSize = 9,
    category = "all",
    brands = [],
    minPrice = 0,
    maxPrice = Infinity,
    minRating = 0,
    sort = "featured",
    search = "",
  } = query;

  let items = [...ALL_PRODUCTS];

  if (category && category !== "all") {
    items = items.filter((p) => p.category === category);
  }
  if (brands.length) {
    items = items.filter((p) => brands.includes(p.brand));
  }
  items = items.filter((p) => p.price >= minPrice && p.price <= maxPrice && p.rating >= minRating);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  switch (sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      items.sort((a, b) => (b.badge === "new") - (a.badge === "new"));
      break;
    default:
      break; // "featured" — keep catalogue order
  }

  return paginate(items, page, pageSize);
}

/**
 * getShopFilterOptions — brand list + min/max price bounds for building the
 * Shop page's filter panel, computed off the live (dummy) catalogue so it
 * never drifts out of sync with what's actually in stock.
 */
export async function getShopFilterOptions() {
  await wait(DELAY / 2);
  const brandNames = Array.from(new Set(ALL_PRODUCTS.map((p) => p.brand))).sort();
  const prices = ALL_PRODUCTS.map((p) => p.price);
  return {
    categories: CATEGORIES,
    brands: brandNames,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

/**
 * getNewArrivalsPage — the /new-arrivals page's main data call: filter by
 * category, sort, then paginate the full New Arrivals catalogue.
 *
 * @param {import("../types/home.js").NewArrivalsQuery} [query]
 * @returns {Promise<import("../types/home.js").PaginatedResponse>}
 */
export async function getNewArrivalsPage(query = {}) {
  await wait(DELAY);
  const { page = 1, pageSize = 9, category = "all", sort = "newest" } = query;

  let items = [...NEW_ARRIVALS_FULL];

  if (category && category !== "all") {
    items = items.filter((p) => p.category === category);
  }

  switch (sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
    default:
      items.sort((a, b) => a.daysAgo - b.daysAgo);
      break;
  }

  return paginate(items, page, pageSize);
}

/**
 * getNewArrivalsCategories — only the categories that actually have at least
 * one New Arrival right now, for building the page's filter tabs (keeps the
 * tab list honest instead of showing a category with zero matching items).
 */
export async function getNewArrivalsCategories() {
  await wait(DELAY / 2);
  const presentSlugs = new Set(NEW_ARRIVALS_FULL.map((p) => p.category));
  return CATEGORIES.filter((c) => presentSlugs.has(c.slug));
}