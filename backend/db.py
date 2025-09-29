
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import MetaData, Table
import os
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:123@localhost:5432/mydb"
)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base = declarative_base()

metadata = MetaData()

parking_table = Table("parking", metadata, autoload_with=engine) 
location_table = Table("location", metadata, autoload_with=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

