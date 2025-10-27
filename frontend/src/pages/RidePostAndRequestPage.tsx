import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

type Mode = "rider" | "driver";
interface RideData {
  from: string;
  to: string;
  date: string;
  seats?: number;
  cost?: number;
  note?: string;
  mode: Mode;
}

export default function RidePostAndRequestPage() {
  const [mode, setMode] = useState<Mode>("rider");
  const [form, setForm] = useState<RideData>({
    from: "",
    to: "",
    date: "",
    seats: 1,
    cost: 0,
    note: "",
    mode: "rider",
  });
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [confirmation, setConfirmation] = useState("");
  const [trips, setTrips] = useState<any[]>([]);

  // --- [TEMP] mock backend endpoints -----------------------------------------------
  async function postRide(data: RideData) {
    const res = await fetch("/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : { id: Date.now(), ...data };
  }

  async function getRide(id: number | string) {
    const res = await fetch(`/rides/${id}`);
    return res.ok ? await res.json() : null;
  }
  // --------------------------------------------------------------------------

  // [TEMP] mock: auto-fetch rides list (would hit backend later)
  useEffect(() => {
    setTrips([
      { id: 1, date: "Fri Oct 13 7:30 AM", seats: 2, rating: 4.8, price: 9.0 },
      { id: 2, date: "Fri Oct 13 8:00 AM", seats: 4, rating: 4.9, price: 10.0 },
    ]);
  }, []);

  // [TEST] simple fake geocoder using random nearby coords
  function fakeGeocode(address: string): [number, number] {
    const base = address.toLowerCase().includes("kitchener")
      ? [43.45, -80.49]
      : [43.47, -80.54];
    return [base[0] + Math.random() * 0.01, base[1] + Math.random() * 0.01];
  }

  // update coordinates when from/to change
  useEffect(() => {
    if (form.from && form.to) {
      const start = fakeGeocode(form.from);
      const end = fakeGeocode(form.to);
      setCoords([start, end]);
    }
  }, [form.from, form.to]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ride = await postRide(form);
    setConfirmation(
      `✅ ${
        form.mode === "driver" ? "Ride posted" : "Request sent"
      } successfully!`
    );
    await getRide(ride.id);
    setForm({ ...form, from: "", to: "", date: "", note: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mode Toggle */}
      <div className="flex justify-center mt-3">
        <div className="inline-flex border rounded-lg overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setMode("rider")}
            className={`px-6 py-2 font-medium ${
              mode === "rider"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            } border-r`}
          >
            Rider
          </button>
          <button
            type="button"
            onClick={() => setMode("driver")}
            className={`px-6 py-2 font-medium ${
              mode === "driver"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Driver
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white shadow-sm space-y-3 mt-3"
      >
        <input
          name="from"
          value={form.from}
          onChange={handleChange}
          placeholder="Departure location"
          className="w-full border rounded-md p-2"
          required
        />
        <input
          name="to"
          value={form.to}
          onChange={handleChange}
          placeholder="Destination"
          className="w-full border rounded-md p-2"
          required
        />
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />
        {mode === "driver" && (
          <>
            <input
              type="number"
              name="seats"
              value={form.seats}
              min={1}
              onChange={handleChange}
              placeholder="Available seats"
              className="w-full border rounded-md p-2"
              required
            />
            <input
              type="number"
              step="0.01"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              placeholder="Cost per passenger ($)"
              className="w-full border rounded-md p-2"
              required
            />
          </>
        )}
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Notes or preferences"
          className="w-full border rounded-md p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold"
        >
          {mode === "rider" ? "Request Ride" : "Post Ride"}
        </button>
        {confirmation && (
          <p className="text-green-600 text-center font-medium mt-2">
            {confirmation}
          </p>
        )}
      </form>

      {/* Rider Mode: Map + Available Trips */}
      {mode === "rider" && (
        <>
          {/* Map preview */}
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Route Preview
            </h3>
            <div className="rounded-lg overflow-hidden border h-64">
              <MapContainer
                bounds={[[43.47, -80.53]]}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  {...({
                    attribution:
                      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  } as any)}
                />
                {coords.length === 2 && (
                  <>
                    <Marker position={coords[0]} />
                    <Marker position={coords[1]} />
                    <Polyline
                      positions={coords}
                      pathOptions={{ color: "blue" }}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Trip list */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Trips available from {form.from || "Waterloo"} to{" "}
              {form.to || "Kitchener"}:
            </p>
            {trips.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center border rounded-lg p-3 bg-white shadow-sm"
              >
                <div>
                  <p className="font-semibold">{t.date}</p>
                  <p className="text-sm text-gray-500">
                    Seats: {t.seats} | Rating: {t.rating}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${t.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    Cash or digital payment
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Driver Mode: Summary + Previous Trips */}
      {mode === "driver" && (
        <div className="p-4 space-y-4">
          {/* Monthly Summary */}
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Monthly Summary:
          </h3>
          <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-700">
            <p>
              Trips given: <span className="font-semibold">11</span>
            </p>
            <p>
              Total earned: <span className="font-semibold">$104.50</span>
            </p>
            <p>
              Total Distance Driven:{" "}
              <span className="font-semibold">64.9 km</span>
            </p>
            <p>
              Average earned: <span className="font-semibold">$9.50</span>
            </p>
            <p>
              Average Trip Distance:{" "}
              <span className="font-semibold">5.9 km</span>
            </p>
            <p>
              Average Rating: <span className="font-semibold">4.8 / 5.0</span>
            </p>
          </div>

          {/* Previous Trips */}
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Previous Trips:
          </h3>
          {[
            { id: 1, date: "Fri, Sept 30, 7:30 AM", passengers: 1, price: 9.0 },
            { id: 2, date: "Thu, Sept 29, 6:00 PM", passengers: 2, price: 18.0 },
            { id: 3, date: "Mon, Sept 26, 8:00 AM", passengers: 1, price: 7.5 },
            { id: 4, date: "Sat, Sept 24, 12:00 PM", passengers: 1, price: 11.5 },
          ].map((trip) => (
            <div
              key={trip.id}
              className="flex justify-between border rounded-lg p-3 bg-white shadow-sm"
            >
              <div>
                <p className="font-semibold">{trip.date}</p>
                <p className="text-sm text-gray-500">
                  Passengers: {trip.passengers} | Rating feedback: 👍
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">${trip.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">(Cash payment only)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
