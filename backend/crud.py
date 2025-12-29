from sqlalchemy.orm import Session
from models import Owner, Car, RepairJob, Component, Labor

def create_owner(db: Session, name: str, phone: int, address: str):
    owner = Owner(name=name, phone=phone, address=address)
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return {"id": owner.id, "name": owner.name, "phone": owner.phone, "address": owner.address}

def create_car(db: Session, model: str, year: int, license_plate: str, owner_id: int):
    # Check if owner exists
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        return None
    
    # Create car
    car = Car(model=model, year=year, license_plate=license_plate, owner_id=owner_id)
    db.add(car)
    db.commit()
    db.refresh(car)
    
    # Create repair job for this car
    job = RepairJob(car_id=car.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return {
        "car": {
            "id": car.id,
            "model": car.model,
            "year": car.year,
            "license_plate": car.license_plate,
            "owner_id": car.owner_id
        },
        "repair_job_id": job.id
    }

def add_component(db: Session, job_id: int, name: str, price: float):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        return None
    
    comp = Component(name=name, price=price, job_id=job_id)
    db.add(comp)
    job.parts_cost += price
    db.commit()
    db.refresh(comp)
    return comp

def add_labor(db: Session, job_id: int, count: int, pay: float):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        return None
    
    labor = Labor(count=count, pay=pay, job_id=job_id)
    db.add(labor)
    job.labor_cost += pay
    db.commit()
    db.refresh(labor)
    return labor

def calculate_profit(db: Session, job_id: int, payment: float):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        return None
    
    job.client_payment = payment
    job.profit = payment - (job.parts_cost + job.labor_cost)
    db.commit()
    db.refresh(job)
    return job

def get_job(db: Session, job_id: int):
    return db.query(RepairJob).filter(RepairJob.id == job_id).first()

def get_job_details(db: Session, job_id: int):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if job:
        components = db.query(Component).filter(Component.job_id == job_id).all()
        labors = db.query(Labor).filter(Labor.job_id == job_id).all()
        return {
            "job": job,
            "components": components,
            "labors": labors
        }
    return None