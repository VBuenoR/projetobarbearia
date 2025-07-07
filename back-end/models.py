from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base

class AppointmentStatus(str, enum.Enum):
    BOOKED = "agendado"
    COMPLETED = "concluido"
    PAID = "pago"
    CANCELED = "cancelado"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    
   
    appointments = relationship("Appointment", back_populates="user")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    duration_minutes = Column(Integer) 

class Barber(Base):
    __tablename__ = "barbers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialty = Column(String)

    appointments = relationship("Appointment", back_populates="barber")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    barber_id = Column(Integer, ForeignKey("barbers.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    appointment_time = Column(DateTime)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.BOOKED)

    user = relationship("User", back_populates="appointments")
    barber = relationship("Barber", back_populates="appointments")
    service = relationship("Service")
