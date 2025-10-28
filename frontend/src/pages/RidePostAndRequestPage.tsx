import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Car, 
  Star,
  TrendingUp,
  MapPinned,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

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
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--color-background-warm)' }}>
      <div className="max-w-5xl mx-auto w-full">
      {/* Mode Toggle */}
      <motion.div 
        className="flex justify-center mt-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex rounded-lg overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-secondary)' }}>
          <motion.button
            type="button"
            onClick={() => setMode("rider")}
            className="px-6 py-2 font-medium border-r transition-all flex items-center gap-2"
            style={{
              backgroundColor: mode === "rider" ? 'var(--color-primary)' : 'white',
              color: mode === "rider" ? 'white' : '#4a5568',
              borderRightColor: 'var(--color-secondary)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={18} />
            Rider
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setMode("driver")}
            className="px-6 py-2 font-medium transition-all flex items-center gap-2"
            style={{
              backgroundColor: mode === "driver" ? 'var(--color-primary)' : 'white',
              color: mode === "driver" ? 'white' : '#4a5568'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Car size={18} />
            Driver
          </motion.button>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="p-4 bg-white shadow-sm space-y-3 mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--color-accent)' }} />
          <input
            name="from"
            value={form.from}
            onChange={handleChange}
            placeholder="Departure location"
            className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
            style={{ 
              border: '1px solid var(--color-secondary)'
            }}
            required
          />
        </div>
        
        <div className="relative">
          <MapPinned className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--color-primary)' }} />
          <input
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="Destination"
            className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
            style={{ 
              border: '1px solid var(--color-secondary)'
            }}
            required
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--color-accent)' }} />
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
            style={{ 
              border: '1px solid var(--color-secondary)'
            }}
            required
          />
        </div>
        
        {mode === "driver" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--color-primary)' }} />
              <input
                type="number"
                name="seats"
                value={form.seats}
                min={1}
                onChange={handleChange}
                placeholder="Available seats"
                className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
                style={{ 
                  border: '1px solid var(--color-secondary)'
                }}
                required
              />
            </div>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--color-accent)' }} />
              <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                placeholder="Cost per passenger ($)"
                className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
                style={{ 
                  border: '1px solid var(--color-secondary)'
                }}
                required
              />
            </div>
          </motion.div>
        )}
        
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3" size={18} style={{ color: 'var(--color-accent)' }} />
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Notes or preferences"
            className="w-full rounded-md p-2 pl-10 focus:outline-none focus:ring-2"
            style={{ 
              border: '1px solid var(--color-secondary)'
            }}
          />
        </div>
        
        <motion.button
          type="submit"
          className="w-full text-white py-2 rounded-md font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--color-primary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {mode === "rider" ? "Request Ride" : "Post Ride"}
          <ArrowRight size={18} />
        </motion.button>
        
        <AnimatePresence>
          {confirmation && (
            <motion.p 
              className="text-center font-medium mt-2 flex items-center justify-center gap-2"
              style={{ color: 'var(--color-accent)' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle2 size={18} />
              {confirmation}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Rider Mode: Map + Available Trips */}
      {mode === "rider" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Map preview */}
          <div className="p-4">
            <motion.h3 
              className="text-sm font-semibold mb-2 flex items-center gap-2" 
              style={{ color: 'var(--color-primary)' }}
              initial={{ x: -20 }}
              animate={{ x: 0 }}
            >
              <MapPinned size={18} />
              Route Preview
            </motion.h3>
            <motion.div 
              className="rounded-lg overflow-hidden h-64" 
              style={{ border: '2px solid var(--color-secondary)' }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
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
                      pathOptions={{ color: "#fc4a1a" }}
                    />
                  </>
                )}
              </MapContainer>
            </motion.div>
          </div>

          {/* Trip list */}
          <div className="p-4 space-y-3">
            <p className="text-sm flex items-center gap-2" style={{ color: '#4a5568' }}>
              <Clock size={16} style={{ color: 'var(--color-accent)' }} />
              Trips available from {form.from || "Waterloo"} to{" "}
              {form.to || "Kitchener"}:
            </p>
            {trips.map((t, index) => (
              <motion.div
                key={t.id}
                className="flex justify-between items-center rounded-lg p-3 bg-white shadow-sm cursor-pointer"
                style={{ border: '1px solid var(--color-secondary)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 4px 12px rgba(252, 74, 26, 0.15)',
                  borderColor: 'var(--color-primary)'
                }}
              >
                <div>
                  <p className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                    <Calendar size={16} />
                    {t.date}
                  </p>
                  <p className="text-sm flex items-center gap-2 mt-1" style={{ color: '#718096' }}>
                    <Users size={14} />
                    Seats: {t.seats} | 
                    <Star size={14} style={{ fill: 'var(--color-secondary)', color: 'var(--color-secondary)' }} />
                    Rating: {t.rating}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                    <DollarSign size={16} />
                    {t.price.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: '#718096' }}>
                    Cash or digital payment
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Driver Mode: Summary + Previous Trips */}
      {mode === "driver" && (
        <motion.div 
          className="p-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Monthly Summary */}
          <motion.h3 
            className="text-lg font-semibold mt-4 flex items-center gap-2" 
            style={{ color: 'var(--color-primary)' }}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <TrendingUp size={20} />
            Monthly Summary:
          </motion.h3>
          
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: 'var(--color-background-cool)' }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 189, 202, 0.1)' }}
            >
              <p className="text-xs" style={{ color: '#718096' }}>Trips given</p>
              <p className="text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <Car size={20} />
                11
              </p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: 'var(--color-background-cool)' }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 189, 202, 0.1)' }}
            >
              <p className="text-xs" style={{ color: '#718096' }}>Total earned</p>
              <p className="text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <DollarSign size={20} />
                104.50
              </p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: 'var(--color-background-cool)' }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 189, 202, 0.1)' }}
            >
              <p className="text-xs" style={{ color: '#718096' }}>Total Distance</p>
              <p className="text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <MapPin size={20} />
                64.9 km
              </p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: 'var(--color-background-cool)' }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 189, 202, 0.1)' }}
            >
              <p className="text-xs" style={{ color: '#718096' }}>Average Rating</p>
              <p className="text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <Star size={20} style={{ fill: 'var(--color-secondary)', color: 'var(--color-secondary)' }} />
                4.8
              </p>
            </motion.div>
          </motion.div>

          {/* Previous Trips */}
          <motion.h3 
            className="text-lg font-semibold mt-4 flex items-center gap-2" 
            style={{ color: 'var(--color-primary)' }}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Clock size={20} />
            Previous Trips:
          </motion.h3>
          
          {[
            { id: 1, date: "Fri, Sept 30, 7:30 AM", passengers: 1, price: 9.0 },
            { id: 2, date: "Thu, Sept 29, 6:00 PM", passengers: 2, price: 18.0 },
            { id: 3, date: "Mon, Sept 26, 8:00 AM", passengers: 1, price: 7.5 },
            { id: 4, date: "Sat, Sept 24, 12:00 PM", passengers: 1, price: 11.5 },
          ].map((trip, index) => (
            <motion.div
              key={trip.id}
              className="flex justify-between rounded-lg p-3 bg-white shadow-sm cursor-pointer"
              style={{ border: '1px solid var(--color-secondary)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 4px 12px rgba(252, 74, 26, 0.15)',
                borderColor: 'var(--color-primary)'
              }}
            >
              <div>
                <p className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                  <Calendar size={16} />
                  {trip.date}
                </p>
                <p className="text-sm flex items-center gap-2 mt-1" style={{ color: '#718096' }}>
                  <Users size={14} />
                  Passengers: {trip.passengers} | 
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent)' }} />
                  Rating feedback: 👍
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold flex items-center gap-1 justify-end" style={{ color: 'var(--color-primary)' }}>
                  <DollarSign size={16} />
                  {trip.price.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: '#718096' }}>(Cash payment only)</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      </div>
    </div>
  );
}
