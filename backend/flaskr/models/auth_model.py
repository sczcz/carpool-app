from extensions import db


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
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    postcode = db.Column(db.String(20), nullable=True) 
    city = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)  

# Sambandstabell mellan User och Role
class UserRole(db.Model):
    __tablename__ = 'user_role'
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id', ondelete='CASCADE'), primary_key=True)

class Child(db.Model):
    __tablename__ = 'children'
    child_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    membership_number = db.Column(db.String(255), nullable=False, unique=True)
    first_name = db.Column(db.String(255), nullable=False)  # Ändra firstName till first_name
    last_name = db.Column(db.String(255), nullable=False)  # Ändra lastName till last_name
    phone = db.Column(db.String(20))  # Nullable telefonnummer
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id', ondelete='CASCADE'))
    parent_1_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    parent_2_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))