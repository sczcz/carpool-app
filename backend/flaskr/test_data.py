from extensions import db
from models.auth_model import User, Child, Role, UserRole, ParentChildLink
from models.carpool_model import Car
from datetime import date

def add_test_data():
    kutar_role = Role.query.filter_by(name='kutar').first()
    tumlare_role = Role.query.filter_by(name='tumlare').first()

    if not kutar_role or not tumlare_role:
        print("Roles are missing, make sure roles are seeded before adding test data.")
        return
    
    # Create test user here <---
    test_user = User(
        email='test@example.com',
        #password: 123
        password='scrypt:32768:8:1$B761g5cnxchvKqNo$9c143fc1c9bc712f4ddc5f1dc14c60c6be9b35134458e2fcb6999f0c6ecd50f037888d7b633e70ef50d6b48107b77cf1311d2cec252955b94fd71dc8ed873b58',  # Ensure this is hashed if you're actually going to use it.
        first_name='Test',
        last_name='User',
        address='Test Street 123',
        postcode='12345',
        city='Testville',
        phone='0708555123',
        is_accepted=True
    )
    db.session.add(test_user)
    db.session.commit()


    guardian_role = Role.query.filter_by(name='vårdnadshavare').first()
    if guardian_role:
        existing_role = UserRole.query.filter_by(user_id=test_user.user_id, role_id=guardian_role.role_id).first()
        if not existing_role:
            test_user_role = UserRole(user_id=test_user.user_id, role_id=guardian_role.role_id)
            db.session.add(test_user_role)

    car_1 = Car(
        owner_id=test_user.user_id,
        reg_number='ABC123',
        fuel_type='Gas',
        consumption=7.5,
        model_name='Toyota Corolla'
    )
    
    car_2 = Car(
        owner_id=test_user.user_id,
        reg_number='XYZ789',
        fuel_type='Electric',
        consumption=15.0,
        model_name='Tesla Model 3'
    )
    
    child_1 = Child(
        first_name='ChildOne',
        last_name='TestUser',
        date_of_birth=date(2010, 5, 15),
        phone='123-456-7890',
        role_id=kutar_role.role_id
    )
    
    child_2 = Child(
        first_name='ChildTwo',
        last_name='TestUser',
        date_of_birth=date(2012, 8, 20),
        phone='987-654-3210',
        role_id=tumlare_role.role_id
    )
    
    db.session.add_all([car_1, car_2, child_1, child_2])
    db.session.commit()

    parent_child_link_1 = ParentChildLink(user_id=test_user.user_id, child_id=child_1.child_id)
    parent_child_link_2 = ParentChildLink(user_id=test_user.user_id, child_id=child_2.child_id)

    db.session.add_all([parent_child_link_1, parent_child_link_2])
    db.session.commit()

    print("Test data added successfully.")
