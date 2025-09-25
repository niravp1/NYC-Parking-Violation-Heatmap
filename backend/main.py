from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import Parking, Location
from datetime import datetime

app = FastAPI()

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