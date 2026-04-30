from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./data.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread":False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class MeterData(Base):
    __tablename__ = "meter_data"

    id = Column(Integer, primary_key=True, index = True)

    customer_id = Column(Integer, index=True)

    timestamp = Column(String)

    voltage = Column(Float)

    current = Column(Float)

    power = Column(Float)
    