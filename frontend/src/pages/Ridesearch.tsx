import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Ride = {
  id: string;
  from: string;
  to: string;
  depart_at: string;
  seats_available: number;
  price: number;
  driver_rating?: number;
};

export default function RidePostAndRequestPage() {
  // Filters
  const [mode, setMode] = useState<"find" | "post">("find");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState<number>(1);
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Search results
  const [results, setResults] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce timer id
  const [debounceKey, setDebounceKey] = useState(0);

  // Build query params (memoized)
  const query = useMemo(() => ({ origin, destination, date, seats, maxPrice, page }), [origin, destination, date, seats, maxPrice, page]);

  // Trigger search with debounce
  useEffect(() => {
    setError(null);
    setLoading(false);

    const id = window.setTimeout(() => setDebounceKey((k) => k + 1), 450);
    return () => window.clearTimeout(id);
  }, [origin, destination, date, seats, maxPrice, page]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function doSearch() {
      setLoading(true);
      setError(null);
      try {
        // Build query string
        const params = new URLSearchParams();
        if (origin) params.append("origin", origin);
        if (destination) params.append("destination", destination);
        if (date) params.append("date", date);
        if (seats) params.append("seats", String(seats));
        if (maxPrice !== "") params.append("max_price", String(maxPrice));
        params.append("page", String(page));

        const url = (import.meta.env.VITE_API_BASE_URL ?? "") + "/rides/search?" + params.toString();

        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(txt || `Server returned ${resp.status}`);
        }

        const data = await resp.json().catch(() => null);

        // If backend not implemented, allow a graceful placeholder
        if (!data || !data.rides) {
          // placeholder/mock data for UI purposes
          const mock: Ride[] = Array.from({ length: 3 }).map((_, i) => ({
            id: `mock-${page}-${i}`,
            from: origin || "75 University Ave. W, Waterloo",
            to: destination || "200 King St. W, Kitchener",
            depart_at: new Date(Date.now() + (i + 1) * 3600 * 1000).toISOString(),
            seats_available: 3 - i,
            price: 7 + i * 1.5,
            driver_rating: 4.5 - i * 0.2,
          }));
          if (!cancelled) {
            setResults(mock);
            setTotalPages(3);
          }
        } else {
          if (!cancelled) {
            setResults(data.rides || []);
            setTotalPages(data.total_pages || 1);
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doSearch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debounceKey]);

  function resetPagination() {
    setPage(1);
  }

  // wireframe top toggle: rider/driver
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-4">
          <img src="/fare-share-logo.png" alt="FareShare" className="h-12" />
          <div className="text-sm text-gray-700">Account</div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode("find")} className={`flex-1 py-3 rounded border ${mode === "find" ? "bg-gray-200 shadow" : "bg-white"}`}>
            Find a trip
          </button>
          <button onClick={() => setMode("post")} className={`flex-1 py-3 rounded border ${mode === "post" ? "bg-gray-200 shadow" : "bg-white"}`}>
            Post a trip
          </button>
        </div>

        {/* Search area */}
        <div className="bg-gray-50 p-4 rounded mb-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-600">Origin</label>
              <input value={origin} onChange={(e) => { setOrigin(e.target.value); resetPagination(); }} className="mt-1 w-full border rounded p-2" placeholder="Where from?" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Destination</label>
              <input value={destination} onChange={(e) => { setDestination(e.target.value); resetPagination(); }} className="mt-1 w-full border rounded p-2" placeholder="Where to?" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Travel Date</label>
              <input value={date} onChange={(e) => { setDate(e.target.value); resetPagination(); }} type="date" className="mt-1 w-full border rounded p-2" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Seats</label>
              <select value={seats} onChange={(e) => { setSeats(Number(e.target.value)); resetPagination(); }} className="mt-1 w-full border rounded p-2">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} seat{n>1?"s":""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Max Price ($)</label>
              <input value={maxPrice} onChange={(e) => { const v = e.target.value; setMaxPrice(v === "" ? "" : Number(v)); resetPagination(); }} type="number" min={0} className="mt-1 w-full border rounded p-2" />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setPage(1); setDebounceKey(k=>k+1); }} className="w-full bg-blue-600 text-white py-2 rounded">Search</button>
            </div>
          </div>
        </div>

        {/* Results / empty / error */}
        <div className="mb-4">
          {loading && <div className="p-6 text-center">Loading results…</div>}
          {error && <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="p-6 text-center text-gray-600">No trips found. Try adjusting your filters.</div>
          )}

          <ul className="space-y-3">
            {results.map(r => (
              <li key={r.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.from} → {r.to}</div>
                  <div className="text-sm text-gray-600">Departing: {new Date(r.depart_at).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Seats: {r.seats_available} • Rating: {r.driver_rating?.toFixed(1) ?? "N/A"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${r.price.toFixed(2)}</div>
                  <div className="mt-2">
                    <Link to={`/trip/${r.id}`} className="text-sm text-blue-600 underline">View</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
