from werkzeug.security import generate_password_hash
from models.auth_model import User, Role, UserRole
from extensions import db

def seed_admin():
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        admin_role = Role(name='admin')
        db.session.add(admin_role)
        db.session.commit()

    existing_admin = (
        db.session.query(User)
        .join(UserRole, User.user_id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.role_id)
        .filter(Role.name == 'admin')
        .first()
    )

    if existing_admin:
        print("Admin user already exists!")
        return

    # Admin created here <---
    hashed_password = generate_password_hash('supersecurepassword')
    admin_user = User(
        email='admin@example.com',
        password=hashed_password,
        first_name='Admin',
        last_name='User',
        address=None,
        postcode=None,
        city=None,
        phone=None,
        is_accepted=True,
    
    )
    db.session.add(admin_user)
    db.session.commit()

    admin_user_role = UserRole(user_id=admin_user.user_id, role_id=admin_role.role_id)
    db.session.add(admin_user_role)
    db.session.commit()