from extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id', ondelete='CASCADE'), nullable=False)
    message_id = db.Column(db.Integer, db.ForeignKey('carpoolmessage.id', ondelete='CASCADE'), nullable=True)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    user = db.relationship('User', backref='notifications', lazy=True)
    carpool = db.relationship('Carpool', backref='notifications', lazy=True)

    carpool_message = db.relationship('CarpoolMessage', backref='notifications', lazy=True)