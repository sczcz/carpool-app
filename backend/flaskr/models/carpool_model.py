from extensions import db
from datetime import datetime
from sqlalchemy import Enum
from sqlalchemy.orm import relationship

class Carpool(db.Model):
    __tablename__ = 'carpool'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    car_id = db.Column(db.Integer, db.ForeignKey('cars.car_id', ondelete='CASCADE'))
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.activity_id', ondelete='SET NULL'))  # Koppling till aktivitet
    available_seats = db.Column(db.Integer, nullable=False)
    departure_address = db.Column(db.String(255), nullable=False)  # Adress för utgångsplats
    departure_postcode = db.Column(db.String(20), nullable=False)  # Postnummer för utgångsplats
    departure_city = db.Column(db.String(100), nullable=False)  # Ort för utgångsplats
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # När carpoolen skapades

    car = relationship('Car', backref='carpools', lazy='joined')
    passengers = relationship('Passenger', backref='carpool', lazy='dynamic')  # Lazy loading for better performance

    # New column for carpool type
    carpool_type = db.Column(Enum('drop-off', 'pick-up', 'both', name='carpool_type_enum'), nullable=False)

# Passagerar-tabell
class Passenger(db.Model):
    __tablename__ = 'passengers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.child_id', ondelete='CASCADE'))  
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id', ondelete='CASCADE'))

class Car(db.Model):
    __tablename__ = 'cars'
    car_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    reg_number = db.Column(db.String(20), nullable=False, unique=True)
    fuel_type = db.Column(db.String(50), nullable=True)  # "Electric", "Gas", "Hybrid"
    consumption = db.Column(db.Float, nullable=True)  # Bränsleförbrukning (liter eller kWh)
    model_name = db.Column(db.String(255), nullable=True)  # Bilmodell