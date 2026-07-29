import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function VendorHome() {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("authUser") || "{}"), []);
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("authToken")}` };
    async function load() {
      try {
        const [dashboardResponse, productsResponse] = await Promise.all([
          fetch(`${API_URL}/vendor/dashboard/`, { headers }),
          fetch(`${API_URL}/vendor/products/`, { headers }),
        ]);
        if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
          navigate("/login", { replace: true });
          return;
        }
        const [dashboard, productData] = await Promise.all([dashboardResponse.json(), productsResponse.json()]);
        if (!dashboardResponse.ok || !productsResponse.ok) throw new Error(dashboard.error || productData.error || "Unable to load vendor home");
        setMetrics(dashboard.metrics);
        setProducts(productData.products.slice(0, 4));
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    load();
  }, [navigate]);

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  }

  const stats = metrics ? [["Products", metrics.totalProducts], ["In stock units", metrics.inventoryUnits], ["Approved", metrics.approvedProducts], ["Awaiting review", metrics.pendingProducts]] : [];

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-gold-soft bg-ivory">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/vendor" className="font-serif text-3xl font-semibold">Divishaa <span className="text-gold">.couture</span></Link>
          <div className="flex items-center gap-3">
            <Link to="/vendor/products" className="bg-ink px-4 py-2.5 text-xs uppercase tracking-widest text-ivory transition hover:bg-maroon">Add product</Link>
            <button onClick={logout} className="border border-gold-soft px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-ink hover:text-ivory">Sign out</button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-ink px-6 py-20 text-ivory">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(173,138,84,.35),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.28em] text-gold-soft">Vendor home</p>
            <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight sm:text-6xl">Welcome back, {user.firstName || "Vendor"}.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory/75">Curate your collection and bring your next signature piece to Divishaa.</p>
            <Link to="/vendor/products" className="mt-8 inline-block bg-gold px-6 py-3 text-xs font-medium uppercase tracking-widest text-ink transition hover:bg-gold-soft">Add a new product</Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          {error && <p className="border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value]) => <div key={label} className="border border-gold-soft bg-white/50 p-5"><p className="text-xs uppercase tracking-widest text-gray">{label}</p><p className="mt-2 font-serif text-4xl">{value}</p></div>)}
          </div>
          <div className="mt-14 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-gold">Collection</p><h2 className="mt-2 font-serif text-4xl">Recent products</h2></div><Link to="/vendor/products" className="text-xs uppercase tracking-widest text-ink underline underline-offset-4">Manage products</Link></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.length ? products.map((product) => <article key={product.id} className="overflow-hidden border border-gold-soft bg-white/50">{product.image ? <img src={product.image} alt={product.name} className="h-52 w-full object-cover" /> : <div className="h-52 bg-ivory-deep" />}<div className="p-4"><p className="text-xs uppercase tracking-widest text-gold">{product.status}</p><h3 className="mt-2 font-serif text-2xl">{product.name}</h3><p className="mt-1 text-sm text-gray">₹{product.price.toLocaleString("en-IN")} · {product.stock} in stock</p></div></article>) : <div className="col-span-full border border-dashed border-gold-soft px-6 py-12 text-center text-gray">Your collection is ready for its first product.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
