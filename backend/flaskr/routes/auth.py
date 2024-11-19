from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
from models.auth_model import User, UserRole, Role
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)
# Tillåt CORS med credentials från specifik origin (din React-app)

# Mapping for role names to role IDs
role_mapping = {
    'Vårdnadshavare': 1,
    'Ledare': 2,
    'Kutar': 3,
    'Tumlare': 4,
    'Upptäckare': 5,
    'Äventyrare': 6,
    'Utmanare': 7,
    'Rover': 8
}

def assign_user_role(role, user_id):
    # Kontrollera om rollen finns i role_mapping
    role_id = role_mapping.get(role)
    
    if role_id is None:
        # Om rollen inte finns, returnera ett felmeddelande
        return jsonify({"error": "Invalid role provided!"}), 400
    
    # Skapa och returnera ett UserRole-objekt baserat på role_id
    newUserRole = UserRole(user_id=user_id, role_id=role_id)
    return newUserRole


# Route for user registration (POST)
@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role')
    phone = data.get('phone')
    address = data.get('address')  # Nytt fält
    postcode = data.get('postcode')  # Nytt fält
    city = data.get('city')  # Nytt fält

    # Kontrollera om användaren redan finns
    user_exists = User.query.filter_by(email=email).first()
    
    if user_exists:
        return jsonify({"error": "User already exists!"}), 400

    # Hasha lösenordet innan det sparas
    hashed_password = generate_password_hash(password)

    # Skapa och spara ny användare i databasen
    new_user = User(email=email, password=hashed_password, first_name=first_name, last_name=last_name, phone=phone, address=address, postcode=postcode, city=city)
    db.session.add(new_user)
    db.session.commit()


    # Använd funktionen för att tilldela rätt roll
    try:
        newUserRole = assign_user_role(role, new_user.user_id)
        db.session.add(newUserRole)
        db.session.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
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
    response.set_cookie('jwt_token', token, httponly=True, secure=False, samesite='Lax')  # för lokal utveckling (ändra vid produktion)
    
    return response


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    # Create a response to send back to the user
    response = make_response(jsonify({"message": "Logout successful!"}))
    
    # Clear the JWT token by setting the cookie with an expired date
    response.set_cookie('jwt_token', '', expires=0, httponly=True, secure=False, samesite='Lax')  # For local dev
    
    return response


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('jwt_token')

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
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