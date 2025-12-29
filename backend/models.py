from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Owner(Base):
    __tablename__ = "owners"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(Integer)
    address = Column(String)
    cars = relationship("Car", back_populates="owner")

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String)
    year = Column(Integer)
    license_plate = Column(String, unique=True)
    owner_id = Column(Integer, ForeignKey("owners.id"))
    owner = relationship("Owner", back_populates="cars")
    job = relationship("RepairJob", back_populates="car", uselist=False)

class RepairJob(Base):
    __tablename__ = "repair_jobs"
    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"))
    parts_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    client_payment = Column(Float, default=0.0)
    profit = Column(Float, default=0.0)
    car = relationship("Car", back_populates="job")
    components = relationship("Component", back_populates="job")
    labors = relationship("Labor", back_populates="job")

class Component(Base):
    __tablename__ = "components"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    fault = Column(String, default="")   # <-- new column
    price = Column(Float)
    job_id = Column(Integer, ForeignKey("repair_jobs.id"))
    job = relationship("RepairJob", back_populates="components")


class Labor(Base):
    __tablename__ = "labors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    pay = Column(Integer, nullable=False)
    job_id = Column(Integer, ForeignKey("repair_jobs.id"))

    job = relationship("RepairJob", back_populates="labors")

