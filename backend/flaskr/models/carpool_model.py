from extensions import db
from datetime import datetime
from sqlalchemy import Enum, CheckConstraint
from sqlalchemy.orm import relationship

class Carpool(db.Model):
    __tablename__ = 'carpool'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))
    car_id = db.Column(db.Integer, db.ForeignKey('cars.car_id', ondelete='CASCADE'))
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.activity_id', ondelete='CASCADE'))
    available_seats = db.Column(db.Integer, nullable=False)
    departure_address = db.Column(db.String(255), nullable=False)
    departure_postcode = db.Column(db.String(20), nullable=False)
    departure_city = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    car = relationship('Car', backref='carpools', lazy='joined')
    passengers = relationship('Passenger', backref='carpool', lazy='dynamic')

    carpool_type = db.Column(Enum('drop-off', 'pick-up', 'both', name='carpool_type_enum'), nullable=False)

class Passenger(db.Model):
    __tablename__ = 'passengers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.child_id', ondelete='CASCADE'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=True)
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        CheckConstraint('(child_id IS NOT NULL OR user_id IS NOT NULL)', name='check_child_or_user'),
    )

class Car(db.Model):
    __tablename__ = 'cars'
    car_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    reg_number = db.Column(db.String(20), nullable=False, unique=True)
    fuel_type = db.Column(db.String(50), nullable=True)
    consumption = db.Column(db.Float, nullable=True)
    model_name = db.Column(db.String(255), nullable=True)