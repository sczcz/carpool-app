# user_handler.py
from flask import Blueprint, request, jsonify, make_response
from extensions import db
from models.auth_model import User
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
