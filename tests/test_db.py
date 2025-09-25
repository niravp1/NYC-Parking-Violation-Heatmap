from backend.db import engine, SessionLocal
from backend.models import Parking

session = SessionLocal()

# query first row
row = session.query(Parking).first()
if row:
    print(row.__dict__)  
else:
    print("No data found in parking table")

session.close()