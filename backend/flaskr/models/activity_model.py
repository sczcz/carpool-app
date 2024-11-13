from extensions import db

class Activity(db.Model):
    __tablename__ = 'activities'
    activity_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id', ondelete='CASCADE'))
    address = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    is_visible = db.Column(db.Boolean, nullable=False, default=True) 