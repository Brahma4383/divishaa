import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @typedef {Object} Slide
 * @property {string} id
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} [highlight] - substring of title to render in gold italics
 * @property {string} subtitle
 * @property {string} image
 * @property {string} ctaPrimary
 * @property {string} ctaSecondary
 */

/**
 * Banner
 * Full-width, full-height auto-sliding hero with prev/next controls and dots.
 *
 * @param {{ slides: Slide[], onShopNow?: () => void, onExplore?: () => void, intervalMs?: number }} props
 */
export default function Banner({ slides = [], onShopNow, onExplore, intervalMs = 5500 }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      if (!slides.length) return;
      setCurrent(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (!slides.length) return undefined;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo(current + 1), intervalMs);
    return () => clearInterval(timerRef.current);
  }, [current, slides.length, intervalMs, goTo]);

  if (!slides.length) {
    return <div className="h-[70vh] w-full animate-pulse bg-ivory-deep" aria-hidden="true" />;
  }

  return (
    <section className="relative h-[100vh] min-h-[560px] w-full overflow-hidden bg-ink" aria-roledescription="carousel">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== current}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover brightness-[.62] saturate-[1.05]"
          />
          <div className="relative z-10 max-w-xl px-[8vw] text-ivory">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold-soft">{slide.eyebrow}</span>
            <h1 className="mt-3 font-serif text-[clamp(44px,7vw,84px)] font-medium leading-[1.02]">
              {renderTitle(slide.title, slide.highlight)}
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-light">{slide.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onShopNow}
                className="bg-gold px-8 py-4 text-xs font-medium uppercase tracking-widest text-ink transition hover:bg-ivory"
              >
                {slide.ctaPrimary}
              </button>
              <button
                type="button"
                onClick={onExplore}
                className="border border-ivory px-8 py-4 text-xs uppercase tracking-widest text-ivory transition hover:bg-ivory hover:text-ink"
              >
                {slide.ctaSecondary}
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => goTo(current - 1)}
        aria-label="Previous slide"
        className="absolute left-6 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/50 text-ivory transition hover:bg-ivory/15"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(current + 1)}
        aria-label="Next slide"
        className="absolute right-6 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/50 text-ivory transition hover:bg-ivory/15"
      >
        ›
      </button>

      <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-gold" : "w-2 bg-ivory/40"}`}
          />
        ))}
      </div>
    </section>
  );
}

function renderTitle(title, highlight) {
  if (!highlight || !title.includes(highlight)) return title;
  const [before, after] = title.split(highlight);
  return (
    <>
      {before}
      <em className="text-gold-soft not-italic italic">{highlight}</em>
      {after}
    </>
  );
}
