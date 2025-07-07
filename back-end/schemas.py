from pydantic import BaseModel, EmailStr
import datetime
from typing import List, Optional
from models import AppointmentStatus 

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserInDB(BaseModel):
    id: int
    username: str
    email: EmailStr
    
    class Config:
        from_attributes = True 


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int

    class Config:
        from_attributes = True


class BarberBase(BaseModel):
    name: str
    specialty: Optional[str] = None

class BarberCreate(BarberBase):
    pass

class Barber(BarberBase):
    id: int

    class Config:
        from_attributes = True 


class AppointmentCreate(BaseModel):
    barber_id: int
    service_id: int
    appointment_time: datetime.datetime

class Appointment(BaseModel):
    id: int
    appointment_time: datetime.datetime
    status: AppointmentStatus 
    user: UserInDB
    barber: Barber
    service: Service

    class Config:
        from_attributes = True 


class PaymentCreate(BaseModel):
    payment_method: str 