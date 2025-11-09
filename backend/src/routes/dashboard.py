import logging
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from src.config.db import get_db
from src.models.booking import Booking
from src.models.ride import Ride
from src.models.user import User
from src.models.review import Review
from src.schemas.dashboard import DashboardResponse

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/{user_id}", response_model=DashboardResponse)
async def get_dashboard_data(
    user_id: str,
    role: str = Query("rider", pattern="^(rider|driver)$"),
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"📊 Dashboard request: user_id={user_id}, role={role}")

    # Fetch user
    result_user = await db.execute(select(User).filter(User.id == user_id))
    user = result_user.scalar_one_or_none()
    if not user:
        logger.warning(f"⚠️ User {user_id} not found.")
        return DashboardResponse(
            totalTrips=0, 
            totalSpent=0.0, 
            totalEarned=0.0, 
            avgTripCost=0.0,
            recentTrips=[]
        )

    # Calculate date range for "this month"
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_trips = 0
    total_spent = 0.0
    total_earned = 0.0
    avg_trip_cost = 0.0
    recent_trips = []

    # ---------- Rider view ----------
    if role == "rider":
        logger.info("👤 Fetching rider dashboard data...")

        # Monthly stats: trips and spending THIS MONTH
        result = await db.execute(
            select(
                func.coalesce(func.sum(Booking.amount_paid), 0),
                func.count(Booking.id)
            ).filter(
                Booking.passenger_id == user_id,
                Booking.status == "completed",
                Booking.booked_at >= start_of_month  # Only this month
            )
        )
        total_spent, total_trips = result.one()

        # Calculate average trip cost (all time, for better sample size)
        result_avg = await db.execute(
            select(
                func.coalesce(func.avg(Booking.amount_paid), 0)
            ).filter(
                Booking.passenger_id == user_id,
                Booking.status == "completed"
            )
        )
        avg_trip_cost = result_avg.scalar_one()

        # Recent trips (latest 5 bookings, all time)
        result = await db.execute(
            select(
                Booking.ride_id,
                Ride.origin_label.label("origin_label"),
                Ride.destination_label.label("destination_label"),
                Booking.amount_paid,
                Booking.seats_reserved,
                Booking.status,
                Booking.booked_at,
                User.full_name.label("driver_name")
            )
            .join(Ride, Ride.id == Booking.ride_id)
            .join(User, User.id == Ride.driver_id)
            .filter(Booking.passenger_id == user_id)
            .order_by(desc(Booking.booked_at))
            .limit(5)
        )
        rows = result.mappings().all()

        for r in rows:
            ride_id = str(r["ride_id"])
            
            # Fetch reviews for this ride
            review_result = await db.execute(
                select(
                    Review.rating,
                    Review.comment,
                    User.full_name.label("reviewee_name")
                )
                .join(User, User.id == Review.reviewee_id)
                .filter(
                    Review.ride_id == r["ride_id"],
                    Review.reviewer_id == user_id
                )
            )
            review_rows = review_result.mappings().all()
            
            reviews = [
                {
                    "rating": rev["rating"],
                    "comment": rev["comment"],
                    "reviewer_name": f"You → {rev['reviewee_name']}"
                }
                for rev in review_rows
            ]

            recent_trips.append({
                "ride_id": ride_id,
                "origin_label": r["origin_label"] or "",
                "destination_label": r["destination_label"] or "",
                "amount_paid": float(r["amount_paid"] or 0),
                "seats_reserved": int(r["seats_reserved"] or 0),
                "status": r["status"],
                "booked_at": r["booked_at"].isoformat() if r["booked_at"] else None,
                "driver_name": r["driver_name"] or "Unknown Driver",
                "reviews": reviews
            })

    # ---------- Driver view ----------
    elif role == "driver":
        logger.info("🚗 Fetching driver dashboard data...")

        # Monthly stats: trips and earnings THIS MONTH
        result = await db.execute(
            select(
                func.coalesce(func.sum(Booking.amount_paid), 0),
                func.count(Booking.id)
            )
            .join(Ride, Booking.ride_id == Ride.id)
            .filter(
                Ride.driver_id == user_id,
                Booking.status == "completed",
                Ride.departure_time >= start_of_month  # Only this month
            )
        )
        total_earned, total_trips = result.one()

        # Recent rides (latest 5 rides, all time)
        result = await db.execute(
            select(
                Ride.id.label("ride_id"),
                Ride.origin_label.label("origin_label"),
                Ride.destination_label.label("destination_label"),
                func.coalesce(func.sum(Booking.amount_paid), 0).label("total_earned"),
                func.coalesce(func.sum(Booking.seats_reserved), 0).label("total_seats_booked"),
                Ride.status,
                Ride.departure_time.label("booked_at")
            )
            .join(Booking, Ride.id == Booking.ride_id, isouter=True)
            .filter(
                Ride.driver_id == user_id,
                Ride.status == "completed"
            )
            .group_by(
                Ride.id,
                Ride.origin_label,
                Ride.destination_label,
                Ride.status,
                Ride.departure_time
            )
            .order_by(desc(Ride.departure_time))
            .limit(5)
        )
        rows = result.mappings().all()

        for r in rows:
            ride_id = str(r["ride_id"])
            
            # Fetch passenger names
            passenger_result = await db.execute(
                select(User.full_name)
                .join(Booking, Booking.passenger_id == User.id)
                .filter(Booking.ride_id == r["ride_id"])
            )
            passenger_names = [p[0] for p in passenger_result.all()]
            
            # Fetch reviews
            review_result = await db.execute(
                select(
                    Review.rating,
                    Review.comment,
                    User.full_name.label("reviewer_name")
                )
                .join(User, User.id == Review.reviewer_id)
                .filter(
                    Review.ride_id == r["ride_id"],
                    Review.reviewee_id == user_id
                )
            )
            review_rows = review_result.mappings().all()
            
            reviews = [
                {
                    "rating": rev["rating"],
                    "comment": rev["comment"],
                    "reviewer_name": rev["reviewer_name"]
                }
                for rev in review_rows
            ]

            recent_trips.append({
                "ride_id": ride_id,
                "origin_label": r["origin_label"] or "",
                "destination_label": r["destination_label"] or "",
                "amount_paid": float(r["total_earned"] or 0),
                "seats_reserved": int(r["total_seats_booked"] or 0),
                "status": r["status"],
                "booked_at": r["booked_at"].isoformat() if r["booked_at"] else None,
                "passenger_names": passenger_names,
                "reviews": reviews
            })

    logger.info(
        f"✅ Dashboard result for {role} user {user_id}: "
        f"trips={total_trips}, spent={total_spent}, earned={total_earned}, avg={avg_trip_cost}"
    )

    return DashboardResponse(
        totalTrips=total_trips,
        totalSpent=float(total_spent),
        totalEarned=float(total_earned),
        avgTripCost=float(avg_trip_cost),
        recentTrips=recent_trips
    )