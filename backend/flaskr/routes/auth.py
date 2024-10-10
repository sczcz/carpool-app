from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
from models.auth_model import User
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)
# Tillåt CORS med credentials från specifik origin (din React-app)
CORS(auth_bp, supports_credentials=True, origins='http://localhost:3000')

# Route for user registration (POST)
@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Kontrollera om användaren redan finns
    user_exists = User.query.filter_by(email=email).first()
    
    if user_exists:
        return jsonify({"error": "User already exists!"}), 400

    # Hasha lösenordet innan det sparas
    hashed_password = generate_password_hash(password)

    # Skapa och spara ny användare i databasen
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": f"User {email} created!"}), 201


# Route för inloggning (POST)
@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Hitta användaren via email
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password!"}), 401

    # Skapa JWT-token
    token = jwt.encode({
        'sub': user.user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, current_app.config['JWT_SECRET'], algorithm='HS256')

    # Skriv ut token för felsökning
    print(f"Generated JWT token for user {user.email}: {token}", flush=True)

    # Skicka JWT-tokenen som en HttpOnly-cookie
    response = make_response(jsonify({"message": "Login successful!"}))
    response.set_cookie('jwt_token', token, httponly=True, secure=True, samesite='None')  # för lokal utveckling (ändra vid produktion)
    
    return response


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Hämta token från cookies
        print(f"Cookies received: {request.cookies}", flush=True)  # Logga alla cookies
        token = request.cookies.get('jwt_token')

        # Logga tokenen för felsökning
        print(f"Token received: {token}", flush=True)

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            # Dekryptera tokenen
            data = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
            current_user = User.query.get(data['sub'])

            if current_user is None:
                return jsonify({"error": "User not found!"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except Exception as e:
            return jsonify({"error": f"Token error: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)

    return decorated



# Exempel på en skyddad route
@auth_bp.route('/api/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({"logged_in_as": current_user.email}), 200
