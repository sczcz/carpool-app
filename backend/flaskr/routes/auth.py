from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
from models.auth_model import User, UserRole, Role
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from flask_socketio import join_room, emit
from flask import request
from extensions import socketio


auth_bp = Blueprint('auth', __name__)

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
    role_id = role_mapping.get(role)
    
    if role_id is None:
        return jsonify({"error": "Invalid role provided!"}), 400
    
    newUserRole = UserRole(user_id=user_id, role_id=role_id)
    return newUserRole


@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role')
    phone = data.get('phone')
    address = data.get('address')  
    postcode = data.get('postcode') 
    city = data.get('city')

    user_exists = User.query.filter_by(email=email).first()
    
    if user_exists:
        return jsonify({"error": "Användaren är redan registrerad!"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(email=email, password=hashed_password, first_name=first_name, last_name=last_name, phone=phone, address=address, postcode=postcode, city=city)
    db.session.add(new_user)
    db.session.commit()

    try:
        newUserRole = assign_user_role(role, new_user.user_id)
        db.session.add(newUserRole)
        db.session.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    return jsonify({"message": f"Användare {email} skapad!"}), 201


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Fel användarnamn eller lösenord!"}), 401
    
    if not user.is_accepted:
        return jsonify({"error": "Användarkontot är inte accepterat än!"}), 402
    
    token = jwt.encode({
        'sub': user.user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, current_app.config['JWT_SECRET'], algorithm='HS256')

    print(f"Generated JWT token for user {user.email}: {token}", flush=True)

    user.last_logged_in = datetime.datetime.utcnow()
    db.session.commit()

    response = make_response(jsonify({"message": "Login successful!"}))
    response.set_cookie('jwt_token', token, httponly=True, secure=False, samesite='Lax')  # for local dev env! (change for production!)

    return response

@socketio.on('join_user')
def handle_join_user(data):
    user_id = data.get('user_id')
    if not user_id:
        emit('error', {'error': 'User ID is required to join a room.'}, room=request.sid)
        return

    join_room(f'user_{user_id}')
    emit('join_success', {'message': f'You have joined your notification room.'}, room=request.sid)

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logout successful!"}))
    response.set_cookie('jwt_token', '', expires=0, httponly=True, secure=False, samesite='Lax')  # for local dev
    
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
            
            if not current_user.is_accepted:
                return jsonify({"error": "Användaren har inte godkänts av administratören."}), 403
                    
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except Exception as e:
            return jsonify({"error": f"Token error: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def requires_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            user_roles = (
                Role.query
                .join(UserRole, Role.role_id == UserRole.role_id)
                .filter(UserRole.user_id == current_user.user_id)
                .with_entities(Role.name)
                .all()
            )

            user_roles = [role.name for role in user_roles]
            if required_role not in user_roles:
                return jsonify({"error": "Access denied! Insufficient role."}), 403

            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator