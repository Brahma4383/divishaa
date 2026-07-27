/**
 * Rating
 * Displays a star rating (rounded to nearest whole star) with optional review count.
 *
 * @param {{ value: number, reviewCount?: number, size?: "sm" | "md", showValue?: boolean }} props
 */
export default function Rating({ value = 0, reviewCount, size = "sm", showValue = true }) {
  const rounded = Math.round(value);
  const starSize = size === "md" ? "text-base" : "text-xs";

  return (
    <div className="flex items-center gap-1.5 text-gray" aria-label={`Rated ${value} out of 5`}>
      <span className={`${starSize} tracking-tight text-gold`} aria-hidden="true">
        {"★".repeat(rounded)}
        <span className="text-gray-light">{"★".repeat(5 - rounded)}</span>
      </span>
      {showValue && <span className="text-xs text-gray">{value.toFixed(1)}</span>}
      {typeof reviewCount === "number" && <span className="text-xs text-gray-light">({reviewCount})</span>}
    </div>
  );
}
