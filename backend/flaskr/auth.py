from flask import Blueprint, request, jsonify
from database import db, User
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from flask import current_app
from functools import wraps

auth_bp = Blueprint('auth', __name__)
CORS(auth_bp)  # Enable CORS for the auth blueprint

# Secret key for encoding JWT tokens
JWT_SECRET = "your_jwt_secret_key"

# Route for user registration (POST)
@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists
    user_exists = User.query.filter_by(email=email).first()
    
    if user_exists:
        return jsonify({"error": "User already exists!"}), 400

    # Hash the password before saving
    hashed_password = generate_password_hash(password)

    # Create and save a new user in the database
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": f"User {email} created!"}), 201

# Route for user login (POST)
@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Find the user by email
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password!"}), 401

    # Create JWT token
    token = jwt.encode({
        'sub': user.user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, current_app.config['JWT_SECRET'], algorithm='HS256')

    return jsonify({"access_token": token}), 200

# Middleware to protect routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if the token is passed
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            # Decode the token
            data = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
            current_user = User.query.get(data['sub'])
        except Exception as e:
            return jsonify({"error": str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# Example of a protected route
@auth_bp.route('/api/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({"logged_in_as": current_user.email}), 200
