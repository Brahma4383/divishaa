/**
 * Loader
 * Renders skeleton placeholders while a section's data is being fetched.
 *
 * @param {{ variant?: "product" | "category" | "line" | "spinner", count?: number, className?: string }} props
 */
export default function Loader({ variant = "product", count = 4, className = "" }) {
  if (variant === "spinner") {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`} role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-beige border-t-gold" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (variant === "category") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-[3/4.2] animate-pulse rounded-sm bg-ivory-deep" aria-hidden="true" />
        ))}
      </>
    );
  }

  if (variant === "line") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`h-3 animate-pulse rounded bg-ivory-deep ${className}`} aria-hidden="true" />
        ))}
      </>
    );
  }

  // default: "product" card skeleton
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden="true">
          <div className="aspect-[3/4] animate-pulse rounded-sm bg-ivory-deep" />
          <div className="mt-3 h-2.5 w-1/3 animate-pulse rounded bg-ivory-deep" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-ivory-deep" />
          <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-ivory-deep" />
        </div>
      ))}
    </>
  );
}
