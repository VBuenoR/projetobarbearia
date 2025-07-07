
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

import auth, models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware # <-- Importação necessária

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Barbearia",
    description="API para gerenciamento de uma barbearia, com agendamentos, serviços e pagamentos.",
    version="1.0.0"
)
origins = [
    "http://localhost:5173", # Endereço padrão do Vite/React
    "http://localhost:5174", # Outra porta comum
    "http://localhost:3000", # Endereço padrão do Create React App
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Permite as origens da lista
    allow_credentials=True,     # Permite cookies/autenticação
    allow_methods=["*"],        # Permite todos os métodos (GET, POST, etc)
    allow_headers=["*"],        # Permite todos os cabeçalhos
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def populate_initial_data():
    db = SessionLocal()
    if db.query(models.Barber).count() == 0:
        barbers = [
            models.Barber(name="João Silva", specialty="Cortes Modernos"),
            models.Barber(name="Carlos Souza", specialty="Barba e Bigode"),
            models.Barber(name="Pedro Alves", specialty="Tratamentos Capilares")
        ]
        db.add_all(barbers)
        db.commit()

    if db.query(models.Service).count() == 0:
        services = [
            models.Service(name="Corte de Cabelo", description="Corte com máquina e tesoura.", price=50.0, duration_minutes=45),
            models.Service(name="Design de Barba", description="Aparar e modelar a barba.", price=35.0, duration_minutes=30),
            models.Service(name="Corte e Barba", description="Pacote completo de corte e barba.", price=80.0, duration_minutes=75),
            models.Service(name="Hidratação Capilar", description="Tratamento para fortalecer os fios.", price=60.0, duration_minutes=40)
        ]
        db.add_all(services)
        db.commit()
    
    db.close()

# Rotas de Autenticação

@app.post("/register/", response_model=schemas.Token, tags=["Autenticação"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Rota para registrar um novo usuário."""
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe.")
    
    hashed_password = auth.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    
    token = auth.create_token({"sub": user.username}, expires_delta=timedelta(hours=24))
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login/", response_model=schemas.Token, tags=["Autenticação"])
def login_for_access_token(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Rota para login de usuário e obtenção de token JWT."""
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    
    token = auth.create_token({"sub": db_user.username}, expires_delta=timedelta(hours=24))
    return {"access_token": token, "token_type": "bearer"}

#  Rotas da Barbearia

# Rota de Serviços
@app.get("/services/", response_model=List[schemas.Service], tags=["Barbearia - Público"])
def get_services(db: Session = Depends(get_db)):
    """Retorna uma lista de todos os serviços oferecidos pela barbearia."""
    services = db.query(models.Service).all()
    return services

# Rota da Agenda 
@app.get("/schedule/", response_model=List[schemas.Appointment], tags=["Barbearia - Público"])
def get_schedule(db: Session = Depends(get_db)):
    """Retorna a agenda com todos os agendamentos marcados."""
    appointments = db.query(models.Appointment).filter(models.Appointment.status == models.AppointmentStatus.BOOKED).all()
    return appointments

# escolher Barbeiro
@app.get("/barbers/", response_model=List[schemas.Barber], tags=["Barbearia - Protegido"])
def get_barbers(db: Session = Depends(get_db), current_user: str = Depends(auth.get_current_user)):
    """Retorna uma lista de todos os barbeiros disponíveis. Requer autenticação."""
    barbers = db.query(models.Barber).all()
    return barbers

# marcar Serviço (Protegida)
@app.post("/appointments/", response_model=schemas.Appointment, status_code=201, tags=["Barbearia - Protegido"])
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: str = Depends(auth.get_current_user)):
    """Cria um novo agendamento para o usuário autenticado."""
   
    db_user = db.query(models.User).filter(models.User.username == current_user).first()
    db_barber = db.query(models.Barber).filter(models.Barber.id == appointment.barber_id).first()
    db_service = db.query(models.Service).filter(models.Service.id == appointment.service_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if not db_barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado.")
    if not db_service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    
    # --- Lógica de Conflito de Horário ---
    appointment_start_time = appointment.appointment_time
    appointment_end_time = appointment_start_time + timedelta(minutes=db_service.duration_minutes)

    conflicting_appointments = db.query(models.Appointment).filter(
        models.Appointment.barber_id == appointment.barber_id,
        models.Appointment.appointment_time < appointment_end_time,
        models.Appointment.appointment_time + timedelta(minutes=db_service.duration_minutes) > appointment_start_time,
        models.Appointment.status != models.AppointmentStatus.CANCELED
    ).first()

    if conflicting_appointments:
        raise HTTPException(status_code=409, detail="Conflito de horário. O barbeiro já está ocupado neste período.")

    # Cria o agendamento
    db_appointment = models.Appointment(
        user_id=db_user.id,
        barber_id=appointment.barber_id,
        service_id=appointment.service_id,
        appointment_time=appointment.appointment_time,
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

# Rota de Pagamento 
@app.post("/appointments/{appointment_id}/pay", tags=["Barbearia - Protegido"])
def pay_for_appointment(appointment_id: int, payment: schemas.PaymentCreate, db: Session = Depends(get_db), current_user: str = Depends(auth.get_current_user)):
    """Processa o pagamento de um agendamento específico."""
    db_user = db.query(models.User).filter(models.User.username == current_user).first()
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
        
    if db_appointment.user_id != db_user.id:
        raise HTTPException(status_code=403, detail="Não autorizado a pagar por este agendamento.")
        
    if db_appointment.status == models.AppointmentStatus.PAID:
        raise HTTPException(status_code=400, detail="Este agendamento já foi pago.")
    
    print(f"Processando pagamento para o agendamento {appointment_id} via {payment.payment_method}")

    db_appointment.status = models.AppointmentStatus.PAID
    db.commit()
    
    return {"message": "Pagamento realizado com sucesso!", "appointment_id": appointment_id, "new_status": "pago"}
