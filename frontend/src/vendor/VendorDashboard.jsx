import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const EMPTY_PRODUCT = { name: "", brand: "", description: "", categoryId: "", price: "", originalPrice: "", sizes: "", colors: "", image: "" };
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

function api(path, options = {}) {
  const { headers = {}, ...requestOptions } = options;
  return fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}`, ...headers },
  });
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [categoryResponse, productResponse] = await Promise.all([api("/vendor/categories/"), api("/vendor/products/")]);
      if (categoryResponse.status === 401 || categoryResponse.status === 403) {
        navigate("/login", { replace: true });
        return;
      }
      const [categoryData, productData] = await Promise.all([categoryResponse.json(), productResponse.json()]);
      if (!categoryResponse.ok || !productResponse.ok) throw new Error(categoryData.error || productData.error || "Unable to load products");
      setCategories(categoryData.categories);
      setProducts(productData.products);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const groupedProducts = useMemo(() => categories.map((category) => ({
    ...category,
    products: products.filter((product) => product.categoryId === category.id),
  })), [categories, products]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function toggleSize(size) {
    setForm((current) => {
      const selected = current.sizes.split(",").map((item) => item.trim()).filter(Boolean);
      const next = selected.includes(size) ? selected.filter((item) => item !== size) : [...selected, size];
      return { ...current, sizes: SIZE_OPTIONS.filter((item) => next.includes(item)).join(", ") };
    });
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const response = await api("/vendor/uploads/", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to upload image");
      setForm((current) => ({ ...current, image: data.imageUrl }));
      setMessage("Image uploaded. It will be used when you save the product.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: 1,
      sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
    };
    try {
      const response = await api(editingId ? `/vendor/products/${editingId}/` : "/vendor/products/", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save product");
      setMessage(data.message);
      setEditingId(null);
      setForm(EMPTY_PRODUCT);
      load();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({ name: product.name, brand: product.brand, description: product.description, categoryId: String(product.categoryId), price: String(product.price), originalPrice: product.originalPrice || "", sizes: product.sizes.join(", "), colors: product.colors.join(", "), image: product.image });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product permanently?")) return;
    const response = await api(`/vendor/products/${productId}/`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Unable to delete product");
    else { setMessage(data.message); load(); }
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-gold-soft"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link to="/vendor" className="font-serif text-3xl font-semibold">Divishaa <span className="text-gold">.couture</span></Link><Link to="/vendor" className="text-xs uppercase tracking-widest underline underline-offset-4">Vendor home</Link></div></header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs uppercase tracking-[.25em] text-gold">Vendor workspace</p>
        <h1 className="mt-2 font-serif text-4xl">Add and manage products</h1>
        <p className="mt-2 text-gray">Select a category. Your product is automatically displayed in that category section below.</p>
        {error && <p className="mt-6 border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon">{error}</p>}
        {message && <p className="mt-6 border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

        <section className="mt-8 border border-gold-soft bg-white/50 p-6">
          <h2 className="font-serif text-3xl">{editingId ? "Edit product" : "Add a product"}</h2>
          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <input required name="name" value={form.name} onChange={updateForm} placeholder="Product name" className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm focus:outline-none" />
            <select required name="categoryId" value={form.categoryId} onChange={updateForm} className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm focus:outline-none"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <input name="brand" value={form.brand} onChange={updateForm} placeholder="Brand" className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm" />
            <div className="space-y-2"><label className="block text-xs uppercase tracking-widest text-gray">Upload from laptop</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} className="block w-full text-sm text-gray file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-widest file:text-ivory hover:file:bg-maroon disabled:opacity-60" /><p className="text-xs text-gray">JPG, PNG, or WebP · max 5 MB {uploading ? "· Uploading…" : ""}</p></div>
            <div className="md:col-span-2"><label className="mb-2 block text-xs uppercase tracking-widest text-gray">Or add an image URL</label><input type="url" name="image" value={form.image} onChange={updateForm} placeholder="https://example.com/product-image.jpg" className="w-full border border-gold-soft bg-transparent px-3 py-2.5 text-sm" /></div>
            {form.image && <div className="md:col-span-2 flex items-center gap-4 border border-gold-soft p-3"><img src={form.image} alt="Product preview" className="h-20 w-16 object-cover" /><div><p className="text-sm font-medium">Image preview</p><button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))} className="mt-1 text-xs uppercase tracking-widest text-maroon underline underline-offset-4">Remove image</button></div></div>}
            <textarea name="description" value={form.description} onChange={updateForm} placeholder="Description" rows="3" className="md:col-span-2 border border-gold-soft bg-transparent px-3 py-2.5 text-sm" />
            <div className="grid grid-cols-2 gap-4 md:col-span-2"><input required min="0" type="number" name="price" value={form.price} onChange={updateForm} placeholder="Selling price" className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm" /><input min="0" type="number" name="originalPrice" value={form.originalPrice} onChange={updateForm} placeholder="Original price" className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm" /></div>
            <div><p className="mb-2 text-xs uppercase tracking-widest text-gray">Available sizes</p><div className="flex flex-wrap gap-2">{SIZE_OPTIONS.map((size) => { const selected = form.sizes.split(",").map((item) => item.trim()).includes(size); return <button key={size} type="button" onClick={() => toggleSize(size)} aria-pressed={selected} className={`min-w-10 border px-3 py-2 text-xs font-medium transition ${selected ? "border-ink bg-ink text-ivory" : "border-gold-soft bg-transparent text-ink hover:border-ink"}`}>{size}</button>; })}</div></div><input name="colors" value={form.colors} onChange={updateForm} placeholder="Colors: Red, Blue" className="border border-gold-soft bg-transparent px-3 py-2.5 text-sm self-end" />
            <div className="flex gap-3 md:col-span-2"><button className="bg-ink px-5 py-3 text-xs uppercase tracking-widest text-ivory hover:bg-maroon">{editingId ? "Save changes" : "Add product"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_PRODUCT); }} className="border border-gold-soft px-5 py-3 text-xs uppercase tracking-widest">Cancel</button>}</div>
          </form>
        </section>

        <section className="mt-12"><p className="text-xs uppercase tracking-[.25em] text-gold">Your catalogue</p><h2 className="mt-2 font-serif text-4xl">Products by category</h2>{loading ? <p className="mt-6 text-gray">Loading products…</p> : <div className="mt-8 space-y-10">{groupedProducts.map((category) => <div key={category.id}><div className="mb-4 flex items-center gap-3"><h3 className="font-serif text-3xl">{category.name}</h3><span className="text-sm text-gray">{category.products.length} product{category.products.length === 1 ? "" : "s"}</span></div>{category.products.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{category.products.map((product) => <article key={product.id} className="overflow-hidden border border-gold-soft bg-white/50">{product.image && <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />}<div className="p-4"><div className="flex justify-between gap-2"><h4 className="font-medium">{product.name}</h4><span className="text-xs uppercase tracking-wider text-gold">{product.status}</span></div><p className="mt-1 text-sm text-gray">₹{product.price.toLocaleString("en-IN")}</p><div className="mt-4 flex gap-4 text-xs uppercase tracking-wider"><button onClick={() => editProduct(product)} className="underline underline-offset-4">Edit</button><button onClick={() => deleteProduct(product.id)} className="text-maroon underline underline-offset-4">Delete</button></div></div></article>)}</div> : <div className="border border-dashed border-gold-soft px-5 py-6 text-sm text-gray">No {category.name.toLowerCase()} products yet.</div>}</div>)}</div>}</section>
      </main>
    </div>
  );
}
