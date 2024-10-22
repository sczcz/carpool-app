# user_handler.py
from flask import Blueprint, request, jsonify, make_response
from extensions import db
from models.auth_model import User, Role, UserRole, Child
from functools import wraps
from routes.auth import token_required  # Import token_required decorator

user_handler = Blueprint('user_handler', __name__)

# Exempel på en skyddad route
@user_handler.route('/api/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({"logged_in_as": current_user.email}), 200

# Route för att uppdatera användarens adress
@user_handler.route('/api/protected/add-user-address', methods=['POST'])
@token_required
def add_address(current_user):
    
    data = request.get_json()
    address = data.get('address')
    postcode = data.get('postcode')
    city = data.get('city')

    if not all([address, postcode, city]):
        return jsonify({"error": "Address, postcode, and city are required!"}), 400
    
    # Uppdatera användarens adress
    current_user.address = address
    current_user.postcode = postcode
    current_user.city = city

    db.session.commit()

    return make_response(jsonify({"message": "Address updated!"}), 200)

# Exempel på en skyddad route som returnerar inloggad användare och deras roll
@user_handler.route('/api/protected/user', methods=['GET'])
@token_required
def get_logged_in_user(current_user):
    # Hämta användarens roll
    user_role = db.session.query(UserRole, Role).filter(
        UserRole.user_id == current_user.user_id,
        UserRole.role_id == Role.role_id
    ).first()

    role_name = user_role.Role.name if user_role else "Ingen roll tilldelad"

    # Skapa ett svar med den inloggade användarens information
    user_data = {
        "id": current_user.user_id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "address": current_user.address,
        "postcode": current_user.postcode,
        "city": current_user.city,
        "role": role_name  
    }

    return jsonify({"user": user_data}), 200

@user_handler.route('/api/protected/add-child', methods=['POST'])
@token_required
def add_child(current_user):
    data = request.get_json()

    # Get the membership number from the request
    membership_number = data.get('membership_number')

    if not membership_number:
        return jsonify({"error": "Membership number is required!"}), 400

    # Check if the child already exists based on membership_number
    existing_child = Child.query.filter_by(membership_number=membership_number).first()

    if existing_child:
        # If the child exists, update parent_2_id if it's empty
        if not existing_child.parent_2_id:
            existing_child.parent_2_id = current_user.user_id
            db.session.commit()
            return jsonify({"message": f"Parent 2 added to child {existing_child.first_name} {existing_child.last_name}!"}), 200
        else:
            return jsonify({"error": "This child already has two parents!"}), 402
    else:
        # If the child doesn't exist and only membership number is provided, return an error
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        phone = data.get('phone')
        role = data.get('role')

        # If only the membership number is provided but the child doesn't exist, return an error
        if not all([first_name, last_name, role]):
            return jsonify({"error": "Child not found. First name, last name, and role are required to create a new child!"}), 400

        # Get role_id from the role name
        role_id = db.session.query(Role.role_id).filter_by(name=role.lower()).first()
        if not role_id:
            return jsonify({"error": "Invalid role provided!"}), 401

        # Create a new child
        new_child = Child(
            membership_number=membership_number,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role_id=role_id[0],  # role_id is a tuple, so we get the first element
            parent_1_id=current_user.user_id  # Set current user as parent_1
        )

        # Save the child to the database
        db.session.add(new_child)
        db.session.commit()

        return jsonify({"message": f"Child {first_name} {last_name} created!"}), 201
    
    # Route för att hämta en lista över barn för den inloggade användaren
@user_handler.route('/api/protected/get-children', methods=['GET'])
@token_required
def get_children(current_user):
    # Hämta alla barn där den inloggade användaren är förälder
    children = Child.query.filter(
        (Child.parent_1_id == current_user.user_id) | 
        (Child.parent_2_id == current_user.user_id)
    ).all()

    # Skapa en lista med barnens data
    children_data = [
        {
            "first_name": child.first_name,
            "last_name": child.last_name,
            "membership_number": child.membership_number,
            "role": db.session.query(Role.name).filter_by(role_id=child.role_id).first()[0],  # Hämta rollnamn
            "phone": child.phone,
        }
        for child in children
    ]

    return jsonify({"children": children_data}), 200

# Route för att ta bort ett barn baserat på medlemsnummer
@user_handler.route('/api/protected/delete-child', methods=['DELETE'])
@token_required
def delete_child(current_user):
    data = request.get_json()

    # Hämta medlemsnumret från frontend
    membership_number = data.get('membership_number')

    if not membership_number:
        return jsonify({"error": "Membership number is required!"}), 400

    # Hitta barnet baserat på medlemsnummer och kontrollera om den inloggade användaren är en av föräldrarna
    child_to_delete = Child.query.filter(
        (Child.membership_number == membership_number) &
        ((Child.parent_1_id == current_user.user_id) | (Child.parent_2_id == current_user.user_id))
    ).first()

    if not child_to_delete:
        return jsonify({"error": "Child not found or you do not have permission to delete this child!"}), 404

    # Ta bort barnet från databasen
    db.session.delete(child_to_delete)
    db.session.commit()

    return jsonify({"message": f"Child with membership number {membership_number} has been deleted!"}), 200
