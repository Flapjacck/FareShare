from pydantic import BaseModel
from typing import List, Optional

class ReviewInfo(BaseModel):
    rating: int
    comment: Optional[str]
    reviewer_name: str

class Trip(BaseModel):
    ride_id: str
    origin_label: Optional[str]
    destination_label: Optional[str]
    amount_paid: float
    seats_reserved: int
    status: str
    booked_at: Optional[str]
    driver_name: Optional[str] = None      # Add this
    passenger_names: List[str] = []        # Add this
    reviews: List[ReviewInfo] = []      # Add this

class DashboardResponse(BaseModel):
    totalTrips: int
    totalSpent: float = 0.0
    totalEarned: float = 0.0
    avgTripCost: float = 0.0
    recentTrips: List[Trip]
    

