import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    agreeTerms: false,
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
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
    if (!form.role) e.role = "Please select a user role";
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
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors({ general: data.error || "Unable to create account" });
        return;
      }

      navigate("/login", { state: { email: form.email.trim() } });
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      {/* Left form panel — the only scrollable region, so a long form never pushes the whole page down */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-1/2">
        <div className="mx-auto w-full max-w-md flex-1 px-8 py-12 sm:px-16">
          {/* Brand */}
          <Link to="/" className="mb-8 flex flex-col items-center">
            <span className="font-serif text-3xl font-semibold tracking-wide text-ink">Divishaa</span>
            <span className="mt-0.5 text-[11px] tracking-[0.35em] text-gold">.couture</span>
          </Link>

          <h1 className="text-center font-serif text-[28px] font-medium text-ink">Create Account</h1>
          <p className="mb-8 mt-1.5 text-center text-sm text-gray">Join the atelier — exclusive offers await</p>

          {errors.general && (
            <div className="mb-6 rounded-sm border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ananya"
                  autoComplete="given-name"
                  className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                    errors.firstName ? "border-maroon" : "border-gold-soft focus:border-ink"
                  }`}
                />
                {errors.firstName && <p className="mt-1 text-xs text-maroon">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Sharma"
                  autoComplete="family-name"
                  className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                    errors.lastName ? "border-maroon" : "border-gold-soft focus:border-ink"
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-xs text-maroon">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
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
                  errors.email ? "border-maroon" : "border-gold-soft focus:border-ink"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-maroon">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                  errors.password ? "border-maroon" : "border-gold-soft focus:border-ink"
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-maroon">{errors.password}</p>}
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all ${
                        form.password.length >= (i + 1) * 2
                          ? form.password.length >= 8
                            ? "bg-emerald-500"
                            : "bg-gold"
                          : "bg-ivory-deep"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label htmlFor="role" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
                Account type
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`w-full border bg-transparent px-4 py-3 text-sm text-ink transition focus:outline-none ${
                  errors.role ? "border-maroon" : "border-gold-soft focus:border-ink"
                }`}
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-maroon">{errors.role}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={`w-full border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-gray-light transition focus:outline-none ${
                  errors.confirmPassword ? "border-maroon" : "border-gold-soft focus:border-ink"
                }`}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-maroon">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-ink"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer text-xs leading-relaxed text-gray">
                  I agree to the{" "}
                  <Link to="/terms" className="text-ink underline underline-offset-2 transition hover:text-gold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-ink underline underline-offset-2 transition hover:text-gold">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && <p className="mt-1 text-xs text-maroon">{errors.agreeTerms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-ink py-3.5 text-xs font-medium uppercase tracking-widest text-ivory transition hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gold-soft" />
            <span className="text-xs uppercase tracking-widest text-gray">or</span>
            <div className="h-px flex-1 bg-gold-soft" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 border border-gold-soft py-3 text-xs uppercase tracking-widest text-ink transition hover:bg-ivory-deep"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mb-4 mt-8 text-center text-sm text-gray">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-ink underline underline-offset-2 transition hover:text-gold">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right image panel — always full viewport height, never affected by form scroll */}
      <div className="relative hidden h-full lg:block lg:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?q=80&w=1200&auto=format&fit=crop"
          alt="Divishaa couture"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/40" />
        <div className="absolute right-8 top-8 max-w-xs rounded-sm bg-ink/60 px-6 py-5 text-right text-ivory backdrop-blur-sm">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold-soft">New Member Benefits</p>
          {[
            "Early access to new arrivals",
            "Exclusive member-only offers",
            "Free express shipping on first order",
            "Dedicated personal stylist support",
          ].map((benefit) => (
            <div key={benefit} className="mb-3 flex items-center justify-end gap-2.5 last:mb-0">
              <p className="text-sm text-ivory">{benefit}</p>
              <span className="shrink-0 text-xs text-gold-soft">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}