from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initiera SQLAlchemy
db = SQLAlchemy()

# Roll-tabell
class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)

# Användar-tabell
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

# Sambandstabell mellan User och Role
class UserRole(db.Model):
    __tablename__ = 'user_role'
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id', ondelete='CASCADE'), primary_key=True)

# Bil-tabell
class Car(db.Model):
    __tablename__ = 'cars'
    car_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    reg_number = db.Column(db.String(20), nullable=False, unique=True)
    total_seats = db.Column(db.Integer, nullable=False)
    fuel_type = db.Column(db.String(50))  # "Electric", "Gas", "Hybrid"
    consumption = db.Column(db.Float)  # Bränsleförbrukning (liter eller kWh)
    model_name = db.Column(db.String(255))  # Bilmodell

# Carpool-tabell
class Carpool(db.Model):
    __tablename__ = 'carpool'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    car_id = db.Column(db.Integer, db.ForeignKey('cars.car_id', ondelete='CASCADE'))
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # När carpoolen skapades

# Passagerar-tabell
class Passenger(db.Model):
    __tablename__ = 'passengers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id', ondelete='CASCADE'))

# Meddelande-tabell
class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=True)
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id', ondelete='CASCADE'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='sent')  # Status: "sent", "delivered", "read"
