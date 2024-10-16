# user_handler.py
from flask import Blueprint, request, jsonify, make_response
from extensions import db
from models.auth_model import User, Role, UserRole
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
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "address": current_user.address,
        "postcode": current_user.postcode,
        "city": current_user.city,
        "role": role_name  
    }

    return jsonify({"user": user_data}), 200

