from backend.db import Base, parking_table, location_table
from sqlalchemy import MetaData, Table

class Parking(Base):
    __table__ = parking_table

class Location(Base):
    __table__ = location_table