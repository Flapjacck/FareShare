import React, { useState, useEffect } from "react";

import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../utils/api";

interface ReviewInfo {
  rating: number;
  comment: string | null;
  reviewer_name: string;
}

interface Trip {
  ride_id: string;
  origin_label?: string;
  destination_label?: string;
  amount_paid: number;
  seats_reserved: number;
  status: string;
  booked_at: string;
  driver_name?: string;
  passenger_names?: string[];
  reviews?: ReviewInfo[];
}

interface DashboardData {
  totalTrips: number;
  totalSpent?: number;
  totalEarned?: number;
  recentTrips: Trip[];
}

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [dataCache, setDataCache] = useState<{
    rider?: DashboardData;
    driver?: DashboardData;
  }>({});
  const [loadingMap, setLoadingMap] = useState<{ rider: boolean; driver: boolean }>({
    rider: true,
    driver: true,
  });

  // Uncomment these when using in your actual app
  // const { user, token } = useAuth();
  
  // Mock user for demo - REMOVE THIS in your actual app
  const { user, token } = useAuth();
  

  const fetchDashboard = async (selectedRole: "rider" | "driver", silent = false) => {
    if (!user?.id) return;

    try {
      if (!silent) {
        setLoadingMap((prev) => ({ ...prev, [selectedRole]: true }));
      }

      const url = `${API_BASE_URL}/api/dashboard/${encodeURIComponent(
        user.id
      )}?role=${encodeURIComponent(selectedRole)}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data: DashboardData = await res.json();

      setDataCache((prev) => ({ ...prev, [selectedRole]: data }));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [selectedRole]: false }));
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboard("rider").then(() => {
        // Prefetch the other role silently
        fetchDashboard("driver", true);
      });
    }
  }, [user?.id, token]);

  const dashboardData = dataCache[role];
  const loading = loadingMap[role];

  const totalTrips = dashboardData?.totalTrips ?? 0;
  const totalSpent = dashboardData?.totalSpent ?? 0;
  const totalEarned = dashboardData?.totalEarned ?? 0;

  const starRender = (count: number) => "★".repeat(count) + "☆".repeat(5 - count);


  if (!dashboardData && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-orange-600 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-baseline gap-2">
  {user?.full_name || "Dashboard"}
  {user && user.rating_count > 0 ? (
    <span className="text-lg text-gray-500 font-normal">
      {starRender(user.rating_avg)} | {user.rating_count} review
      {user.rating_count !== 1 ? "s" : ""}
    </span>
  ) : (
    <span className="text-lg text-gray-400 font-normal">No reviews yet</span>
  )}
</h1>


            {/* Role Toggle */}
            <div className="flex bg-orange-100 rounded-full p-1">
              <button
                onClick={() => setRole("rider")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  role === "rider"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                Rider
              </button>
              <button
                onClick={() => setRole("driver")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  role === "driver"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                Driver
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-lg font-semibold text-orange-600 mb-2">
                {role === "rider" ? "Trips This Month" : "Trips Completed"}
              </h3>
              <p className="text-4xl font-bold text-gray-800">{totalTrips}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-lg font-semibold text-orange-600 mb-2">
                {role === "rider" ? "Monthly Average Cost" : "Money Earned"}
              </h3>
              <p className="text-4xl font-bold text-gray-800">
                ${(role === "rider" ? totalSpent : totalEarned).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {role === "rider" ? "Recent Trips" : "Recent Rides"}
            {loading && <span className="text-sm text-gray-500 ml-2">(Refreshing...)</span>}
          </h2>

          {dashboardData?.recentTrips?.length ? (
            <div className="space-y-4">
              {dashboardData.recentTrips.map((trip) => (
                <div
                  key={trip.ride_id}
                  className="bg-orange-50 rounded-xl p-6 border border-orange-200 hover:shadow-md transition-shadow"
                >
                  {/* Route Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-2">
                        <span className="text-green-600">📍</span>
                        {trip.origin_label || "Unknown Start"}
                        <span className="text-gray-400">→</span>
                        <span className="text-red-600">📍</span>
                        {trip.destination_label || "Unknown Destination"}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          {new Date(trip.booked_at).toLocaleString()} • {" "}
                          <span className={`font-medium ${
                            trip.status === "completed" ? "text-green-600" : "text-gray-600"
                          }`}>
                            {trip.status}
                          </span>
                        </p>
                        
                        {role === "rider" && trip.driver_name && (
                          <p>Driver: <span className="font-medium">{trip.driver_name}</span></p>
                        )}
                        
                        {role === "driver" && trip.passenger_names && trip.passenger_names.length > 0 && (
                          <p>
                            Passengers: <span className="font-medium">
                              {trip.passenger_names.join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        role === "rider" ? "text-orange-600" : "text-green-600"
                      }`}>
                        ${trip.amount_paid.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {trip.seats_reserved} seat{trip.seats_reserved !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {trip.reviews && trip.reviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {role === "rider" ? "Your Review:" : "Passenger Reviews:"}
                      </h4>
                      <div className="space-y-2">
                        {trip.reviews.map((review, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-orange-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {review.reviewer_name}
                              </span>
                              <span className="text-lg">{starRender(review.rating)}</span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* No Reviews Message */}
                  {(!trip.reviews || trip.reviews.length === 0) && trip.status === "completed" && (
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <p className="text-sm text-gray-500 italic">
                        {role === "rider" 
                          ? "No review submitted yet" 
                          : "No reviews from passengers yet"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No trips yet</p>
              <p className="text-gray-400 text-sm mt-2">
                {role === "rider" 
                  ? "Book your first ride to get started!" 
                  : "Post your first ride to start earning!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;