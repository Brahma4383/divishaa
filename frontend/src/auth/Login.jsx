import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  }

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors({
          general: data.error || "Invalid email or password. Please try again.",
        });
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      navigate("/");
    } catch {
      setErrors({ general: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      {/* Left image panel — always full viewport height, never affected by form scroll */}
      <div className="relative hidden h-full lg:block lg:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
          alt="Divishaa couture"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-ink/30 to-transparent" />
        <div className="absolute bottom-16 left-12 text-ivory">
          <p className="max-w-xs font-serif text-4xl font-medium leading-snug">
            Elegance is not about being noticed —
          </p>
          <p className="mt-1 font-serif text-4xl font-medium italic text-gold-soft">
            it's about being remembered.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-ivory/60">
            — Divishaa.couture
          </p>
        </div>
      </div>

      {/* Right form panel — the only scrollable region, so the form never pushes the whole page down */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-1/2">
        <div className="mx-auto w-full max-w-md flex-1 px-8 py-12 sm:px-16">
          {/* Brand */}
          <Link to="/" className="mb-10 flex flex-col items-center">
            <span className="font-serif text-3xl font-semibold tracking-wide text-ink">
              Divishaa
            </span>
            <span className="mt-0.5 text-[11px] tracking-[0.35em] text-gold">
              .couture
            </span>
          </Link>

          <h1 className="text-center font-serif text-[28px] font-medium text-ink">
            Welcome Back
          </h1>
          <p className="mb-8 mt-1.5 text-center text-sm text-gray">
            Sign in to your account to continue
          </p>

          {errors.general && (
            <div className="mb-6 rounded-sm border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                autoComplete="email"
                className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                  errors.email
                    ? "border-maroon"
                    : "border-gold-soft focus:border-ink"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-maroon">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-widest text-ink"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gold transition hover:text-ink"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                  errors.password
                    ? "border-maroon"
                    : "border-gold-soft focus:border-ink"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-maroon">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-3.5 w-3.5 accent-ink"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer text-xs text-gray"
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-ink py-3.5 text-xs font-medium uppercase tracking-widest text-ivory transition hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gold-soft" />
            <span className="text-xs uppercase tracking-widest text-gray">
              or
            </span>
            <div className="h-px flex-1 bg-gold-soft" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 border border-gold-soft py-3 text-xs uppercase tracking-widest text-ink transition hover:bg-ivory-deep"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mb-4 mt-10 text-center text-sm text-gray">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-ink underline underline-offset-2 transition hover:text-gold"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
