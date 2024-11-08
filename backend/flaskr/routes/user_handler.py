# user_handler.py
from flask import Blueprint, request, jsonify, make_response
from extensions import db
from models.auth_model import User, Role, UserRole, Child, ParentChildLink
from functools import wraps
from datetime import datetime
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
    phone = data.get('phone')

    if not all([address, postcode, city]):
        return jsonify({"error": "Address, postcode, and city are required!"}), 400
    
    # Uppdatera användarens adress
    current_user.address = address
    current_user.postcode = postcode
    current_user.city = city
    current_user.phone = phone

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
        "role": role_name,
        "phone": current_user.phone  
    }

    return jsonify({"user": user_data}), 200



@user_handler.route('/api/protected/add-child', methods=['POST'])
@token_required
def add_child(current_user):
    data = request.get_json()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    role_name = data.get('role')
    date_of_birth_str = data.get('birth_date')  # Datumet skickas som en sträng

    if not first_name or not last_name or not role_name or not date_of_birth_str:
        return jsonify({"error": "First name, last name, role, and date of birth are required!"}), 400

    # Konvertera sträng till date-objekt
    try:
        date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Hämta role_id baserat på rollnamn
    role = Role.query.filter_by(name=role_name.lower()).first()
    if not role:
        return jsonify({"error": "Invalid role provided!"}), 401

    # Skapa ett nytt barn
    new_child = Child(
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role_id=role.role_id,
        date_of_birth=date_of_birth  # Använd det konverterade date-objektet
    )

    # Lägg till och spara barnet för att generera ett child_id
    db.session.add(new_child)
    db.session.commit()  # Detta genererar ett child_id för new_child

    # Lägg till relationen till den inloggade användaren i ParentChildLink
    parent_link = ParentChildLink(user_id=current_user.user_id, child_id=new_child.child_id)
    db.session.add(parent_link)
    db.session.commit()

    return jsonify({"message": f"Child {first_name} {last_name} created!"}), 201



@user_handler.route('/api/protected/get-children', methods=['GET'])
@token_required
def get_children(current_user):
    # Hämta alla barn för den inloggade användaren
    children = db.session.query(Child).join(ParentChildLink).filter(ParentChildLink.user_id == current_user.user_id).all()

    # Skapa en lista med barnens data
    children_data = [
        {
            "child_id" : child.child_id,
            "first_name": child.first_name,
            "last_name": child.last_name,
            "date_of_birth": child.date_of_birth.isoformat(),
            "role": db.session.query(Role.name).filter_by(role_id=child.role_id).first()[0],
            "phone": child.phone,
        }
        for child in children
    ]

    return jsonify({"children": children_data}), 200



@user_handler.route('/api/protected/delete-child', methods=['DELETE'])
@token_required
def delete_child(current_user):
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    date_of_birth = data.get('date_of_birth')

    # Hitta barnet baserat på namn, efternamn och födelsedatum
    child_to_unlink = Child.query.filter_by(
        first_name=first_name,
        last_name=last_name,
        date_of_birth=date_of_birth
    ).first()

    if not child_to_unlink:
        return jsonify({"error": "Child not found!"}), 404

    # Hitta länken mellan föräldern och barnet
    link = ParentChildLink.query.filter_by(user_id=current_user.user_id, child_id=child_to_unlink.child_id).first()

    if not link:
        return jsonify({"error": "No link found between current user and specified child!"}), 404

    # Ta bort länken
    db.session.delete(link)
    db.session.commit()

    # Kontrollera om barnet inte längre är länkat till några föräldrar
    remaining_links = ParentChildLink.query.filter_by(child_id=child_to_unlink.child_id).all()
    if not remaining_links:
        db.session.delete(child_to_unlink)
        db.session.commit()

    return jsonify({"message": f"Unlinked child {first_name} {last_name} from current user!"}), 200



@user_handler.route('/api/protected/update-child-role', methods=['PUT'])
@token_required
def update_child_role(current_user):
    data = request.get_json()
    child_id = data.get('child_id')
    new_role_name = data.get('new_role')

    if not child_id or not new_role_name:
        return jsonify({"error": "Child ID and new role are required!"}), 400

    # Hitta barnet baserat på child_id
    child = Child.query.get(child_id)
    if not child:
        return jsonify({"error": "Child not found!"}), 404

    # Kontrollera att användaren är en förälder till barnet
    link = ParentChildLink.query.filter_by(user_id=current_user.user_id, child_id=child.child_id).first()
    if not link:
        return jsonify({"error": "You do not have permission to update this child's role!"}), 403

    # Hämta det nya role_id från rollen
    role = Role.query.filter_by(name=new_role_name.lower()).first()
    if not role:
        return jsonify({"error": "Invalid role provided!"}), 401

    # Uppdatera barnets roll
    child.role_id = role.role_id
    db.session.commit()

    return jsonify({"message": f"Child's role updated to {new_role_name}!"}), 200

