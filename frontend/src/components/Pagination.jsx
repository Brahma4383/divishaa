/**
 * Pagination
 * Simple numbered pagination with prev/next. Purely presentational —
 * the page owns the current page state and passes it in as props.
 *
 * @param {{ page: number, totalPages: number, onPageChange: (page: number) => void }} props
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-10 w-10 rounded-full border border-gold-soft text-ink transition hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`h-10 w-10 rounded-full text-sm transition ${
            p === page ? "bg-ink text-ivory" : "border border-gold-soft text-ink hover:bg-ivory-deep"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-10 w-10 rounded-full border border-gold-soft text-ink transition hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
