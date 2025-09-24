from db import Base, parking_table
from sqlalchemy import MetaData, Table

class Parking(Base):
    __table__ = parking_table