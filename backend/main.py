from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db import get_db
from backend.models import Parking, Location
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

app = FastAPI()
origins = [ 
"http://localhost:5173" 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,            
    allow_credentials=True,           
    allow_methods=["*"],              
    allow_headers=["*"],              
)

@app.get("/heatmap_data")
def get_heatmap_data(db: Session = Depends(get_db)):
    """
    Retrieves latitude, longitude, and a weight (violation count) 
    for heatmap visualization.
    """
    try:
        results = db.query(
            Location.latitude,
            Location.longitude,
            Location.county,
            func.count(Parking.precinct).label("violation_count")
        ).join(
            Location, Parking.precinct == Location.precinct
        ).group_by(
            Location.latitude, Location.longitude, Location.county
        ).all()

        if not results:
            raise HTTPException(status_code=404, detail="No data found for heatmap.")

        heatmap_points = [
            {
                "lat": r.latitude,
                "lng": r.longitude,
                "weight": r.violation_count
            } for r in results
        ]
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
