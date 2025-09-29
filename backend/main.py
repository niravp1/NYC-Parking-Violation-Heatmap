from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, String
from backend.db import get_db
from backend.models import Parking, Location
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

app = FastAPI()
origins = [ 
"http://localhost:8080",
 "http://backend:8000/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,            
    allow_credentials=True,           
    allow_methods=["*"],              
    allow_headers=["*"],              
)

def format_military_hour(hour_str):
    """Converts a 2-character hour string ('09', '17') to '9 AM', '5 PM', etc."""
    if not hour_str: return "N/A"
    try:
        hour = int(hour_str) 
        if hour == 0: 
            return "12 AM (Midnight)"
        elif hour < 12: 
            return f"{hour} AM"
        elif hour == 12: 
            return "12 PM (Noon)"
        else: 
            return f"{hour - 12} PM"
    except ValueError:
        return "N/A"

def get_most_common_hour_per_precinct(db: Session, precinct_id: int):
    """
    Finds the most common hour of violation for a specific precinct.
    Returns the hour (string '00' to '23') or None.
    """
    # NOTE: Parking.violation_time is assumed to be a character varying (string) type
    most_common_hour_query = db.query(
        func.substr(Parking.violation_time, 1, 2).label('hour'),
        func.count(func.substr(Parking.violation_time, 1, 2)).label('hour_count')
    ).filter(
        Parking.precinct == precinct_id
    ).group_by(
        'hour'
    ).order_by(
        func.count(func.substr(Parking.violation_time, 1, 2)).desc()
    ).first()
    
    return most_common_hour_query.hour if most_common_hour_query else None


@app.get("/heatmap_data")
def get_heatmap_data(hour: int | None = None, db: Session = Depends(get_db)):
    """
    Retrieves latitude, longitude, and a weight (violation count) 
    for heatmap visualization.
    """
    try:
        query = db.query(
            Location.latitude,
            Location.longitude,
            Location.county,
            Location.precinct,
            func.count(Parking.precinct).label("violation_count")
        ).join(
            Location, Parking.precinct == Location.precinct
        )
        if hour is not None and 0 <= hour <= 23:
            hour_str = f"{hour:02d}"
            # This is where the time filtering happens, reducing the dataset BEFORE grouping
            query = query.filter(
                func.substr(Parking.violation_time, 1, 2) == hour_str
            )
        results = query.group_by(
            Location.latitude, Location.longitude, Location.precinct
        ).all()
        if not results:
            raise HTTPException(status_code=404, detail="No data found for heatmap.")
        
        heatmap_points = []
        for r in results:
            
            most_common_hour = get_most_common_hour_per_precinct(db, r.precinct)

            heatmap_points.append({
                "lat": r.latitude,
                "lng": r.longitude,
                "precinct": r.precinct,
                "weight": r.violation_count,
                "common_hour": most_common_hour 
            })
        max_weight = max(p['weight'] for p in heatmap_points) if heatmap_points else 1
        
        return {
            "max_weight": max_weight,
            "points": heatmap_points
        }



    except Exception as e:
        logging.error(f"Error retrieving heatmap data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching heatmap data.")


@app.get("/violations")
def read_violations(issue_date: str, db: Session = Depends(get_db)):
    try:
        filter_date = datetime.strptime(issue_date, '%m/%d/%Y').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use MM/DD/YYYY")
    
    results = db.query(Parking).filter(Parking.issue_date == filter_date).limit(5).all()
    if not results:
        raise HTTPException(status_code=404, detail=f"No violations found for {issue_date}")
    return [r.__dict__ for r in results]


@app.get("/location")
def read_locations(precinct: int, db: Session = Depends(get_db)):
    result = db.query(Location).filter(Location.precinct == precinct).first()
    if not result:
       raise HTTPException(status_code=404, detail=f"No location found for precinct {precinct}")
    
    return {
        "precinct": result.precinct,
        "county": result.county,
        "latitude": result.latitude,
        "longitude": result.longitude
    }

@app.get("/precinct_summary/{precinct_id}")
def get_precinct_summary(precinct_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.precinct == precinct_id).first()
    
    summary_precinct = precinct_id
    summary_county = location.county if location else "Unknown County"


    total_violations = db.query(func.count(Parking.precinct)).filter(
        Parking.precinct == precinct_id
    ).scalar()

    if total_violations == 0:
        raise HTTPException(status_code=404, detail=f"No violations found for precinct {precinct_id}")


    top_violations_query = db.query(
        Parking.violation,
        func.count(Parking.violation).label("violation_count")
    ).filter(
        Parking.precinct == precinct_id
    ).group_by(
        Parking.violation
    ).order_by(
        func.count(Parking.violation).desc()
    ).limit(3).all()

    top_violations = [
        {"description": v.violation, "count": v.violation_count}
        for v in top_violations_query
    ]
    most_common_hour_code = get_most_common_hour_per_precinct(db, precinct_id)
    most_common_time = format_military_hour(most_common_hour_code) 

    return {
        "precinct": summary_precinct,
        "county": summary_county,
        "total_violations": total_violations,
        "top_violations": top_violations,
        "most_common_time": most_common_time
    }
