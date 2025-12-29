from pydantic import BaseModel

class OwnerCreate(BaseModel):
    name: str
    phone: int
    address: str

class CarCreate(BaseModel):
    model: str
    year: int
    license_plate: str
    owner_id: int

class ComponentCreate(BaseModel):
    job_id: int
    name: str
    price: float

class LaborCreate(BaseModel):
    job_id: int
    count: int
    pay: float

class ProfitCreate(BaseModel):
    job_id: int
    payment: float