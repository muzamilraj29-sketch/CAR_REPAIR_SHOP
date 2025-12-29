# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, Base, get_db
from models import Owner, Car, RepairJob, Component, Labor

# ------------------- Create tables -------------------
Base.metadata.create_all(bind=engine)

# ------------------- FastAPI app -------------------
app = FastAPI(title="Car Repair Shop API")

# ------------------- CORS -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ------------------- Serve React frontend -------------------
frontend_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
assets_path = os.path.join(frontend_path, "assets")

if os.path.exists(assets_path):
    app.mount("/static", StaticFiles(directory=assets_path), name="static")

@app.get("/")
def serve_index():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Index file not found. Did you build the frontend?"}

# ------------------- Health check -------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

# ------------------- Owners -------------------
@app.post("/owners/")
def create_owner(owner: dict, db: Session = Depends(get_db)):
    new_owner = Owner(
        name=owner["name"],
        phone=owner["phone"],
        address=owner["address"]
    )
    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)
    return new_owner

@app.get("/owners/")
def get_owners(db: Session = Depends(get_db)):
    return db.query(Owner).all()

# ------------------- Cars -------------------
@app.post("/cars/")
def create_car(car: dict, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == car["owner_id"]).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    new_car = Car(
        model=car["model"],
        year=car["year"],
        license_plate=car["license_plate"],
        owner_id=owner.id
    )
    db.add(new_car)
    db.commit()
    db.refresh(new_car)

    job = RepairJob(car_id=new_car.id)
    db.add(job)
    db.commit()
    db.refresh(job)

    return {"car": new_car, "repair_job_id": job.id}

@app.get("/cars/")
def get_cars(db: Session = Depends(get_db)):
    return db.query(Car).all()

# ------------------- Repair Jobs -------------------
@app.get("/job/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ------------------- Components -------------------
@app.post("/components/")
def add_component(component: dict, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == component["job_id"]).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_component = Component(
        name=component["name"],
        fault=component.get("fault", ""),
        price=component["price"],
        job_id=job.id
    )

    db.add(new_component)
    job.parts_cost += component["price"]  # add to existing parts cost
    db.commit()
    db.refresh(new_component)
    return new_component

# ------------------- Labors -------------------
@app.post("/labors/")
def add_labors(labor_data: dict, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == labor_data["job_id"]).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    total_labor_cost = 0
    for labor in labor_data["labors"]:
        new_labor = Labor(
            name=labor["name"],
            pay=labor["pay"],
            job_id=job.id
        )
        db.add(new_labor)
        total_labor_cost += labor["pay"]

    job.labor_cost += total_labor_cost  # add to existing labor cost
    db.commit()

    return {
        "message": "Labors added successfully",
        "total_labor_cost": job.labor_cost
    }

# ------------------- Profit Calculation -------------------
@app.post("/profit/")
def calculate_profit(data: dict, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == data["job_id"]).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.client_payment = data.get("payment", 0)
    job.profit = job.client_payment - (job.parts_cost + job.labor_cost)
    db.commit()
    db.refresh(job)

    return {"job_id": job.id, "profit": job.profit}

# ------------------- Delete Owner -------------------
@app.delete("/owners/{owner_id}")
def delete_owner(owner_id: int, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    db.delete(owner)
    db.commit()
    return {"message": "Owner and related data deleted"}

# ------------------- Owners with Cars -------------------
@app.get("/owners-with-cars/")
def get_owners_with_cars(db: Session = Depends(get_db)):
    results = (
        db.query(
            Owner.id.label("owner_id"),
            Owner.name,
            Owner.phone,
            Owner.address,
            Car.model,
            Car.year,
            Car.license_plate
        )
        .join(Car, Car.owner_id == Owner.id)
        .all()
    )

    return [
        {
            "owner_id": r.owner_id,
            "name": r.name,
            "phone": r.phone,
            "address": r.address,
            "model": r.model,
            "year": r.year,
            "license_plate": r.license_plate,
        }
        for r in results
    ]

# ------------------- Labors + Components + Profit -------------------
@app.get("/labors-details/{job_id}")
def get_labors_details(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "labors": [
            {"id": l.id, "name": l.name, "pay": l.pay}
            for l in job.labors
        ],
        "components": [
            {"id": c.id, "name": c.name, "fault": getattr(c, "fault", ""), "price": c.price}
            for c in job.components
        ],
        "parts_cost": job.parts_cost,
        "labor_cost": job.labor_cost,
        "client_payment": job.client_payment,
        "profit": job.profit
    }
    
    
@app.get("/job-full/{job_id}")
def get_job_full(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    car = db.query(Car).filter(Car.id == job.car_id).first()
    owner = db.query(Owner).filter(Owner.id == car.owner_id).first()

    return {
        "job_id": job.id,

        "owner": {
            "name": owner.name,
            "phone": owner.phone,
            "address": owner.address
        },

        "car": {
            "model": car.model,
            "year": car.year,
            "license_plate": car.license_plate
        },

        "labors": [
            {"id": l.id, "name": l.name, "pay": l.pay}
            for l in job.labors
        ],

        "components": [
            {
                "id": c.id,
                "name": c.name,
                "fault": c.fault,
                "price": c.price
            }
            for c in job.components
        ],

        "totals": {
            "labor_cost": job.labor_cost,
            "parts_cost": job.parts_cost,
            "client_payment": job.client_payment,
            "profit": job.profit
        }
    }
# DELETE ENTIRE JOB (Owner + Car + Labors + Components)
@app.delete("/jobs-full/{job_id}")
def delete_full_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RepairJob).filter(RepairJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Delete labors
    db.query(Labor).filter(Labor.job_id == job.id).delete()
    # Delete components
    db.query(Component).filter(Component.job_id == job.id).delete()

    # Delete car
    car = job.car
    owner_id = car.owner_id
    db.delete(job)
    db.delete(car)

    # Optional: Delete owner if no more cars
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if owner and len(owner.cars) == 0:
        db.delete(owner)

    db.commit()
    return {"message": "Entire job (Owner, Car, Labors, Components) deleted"}
@app.get("/jobs-full/")
def get_all_jobs_full(db: Session = Depends(get_db)):
    jobs = db.query(RepairJob).all()
    result = []

    for job in jobs:
        car = db.query(Car).filter(Car.id == job.car_id).first()
        if not car:
            continue

        owner = db.query(Owner).filter(Owner.id == car.owner_id).first()

        result.append({
            "job_id": job.id,

            "owner": {
                "name": owner.name if owner else "Deleted Owner",
                "phone": owner.phone if owner else "",
                "address": owner.address if owner else "",
            },

            "car": {
                "model": car.model,
                "year": car.year,
                "license_plate": car.license_plate,
            },

            "labors": [
                {"id": l.id, "name": l.name, "pay": l.pay}
                for l in job.labors
            ],

            "components": [
                {"id": c.id, "name": c.name, "fault": c.fault, "price": c.price}
                for c in job.components
            ],

            "totals": {
                "labor_cost": job.labor_cost,
                "parts_cost": job.parts_cost,
                "client_payment": job.client_payment,
                "profit": job.profit,
            },
        })

    return result
