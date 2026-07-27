import { useEffect, useRef, useState } from "react";

/**
 * useFetch — runs an async service function and exposes { data, loading, error }.
 * Works with any function from `services/productService.js`.
 *
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {any[]} deps - re-run when these change, same rules as useEffect
 * @returns {{ data: T | null, loading: boolean, error: string | null }}
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef.current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
