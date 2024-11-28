from flask import Blueprint, request, jsonify
from extensions import db
from models.auth_model import User, Role, UserRole
from routes.auth import token_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/api/users/all', methods=['GET'])
@token_required
def get_users(current_user):

    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    users = User.query.all()
    users_list = []
    for user in users:
        roles = (
            db.session.query(Role.name)
            .join(UserRole, Role.role_id == UserRole.role_id)
            .filter(UserRole.user_id == user.user_id)
            .all()
        )

        role_names = [role[0] for role in roles]
        users_list.append({
            "id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": role_names,
            "last_logged_in": user.last_logged_in
        })

    return jsonify(users_list), 200


@admin_bp.route('/api/admin/make-admin', methods=['PUT'])
@token_required
def make_user_admin(current_user):
    # Kontrollera att den inloggade användaren är admin
    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    data = request.get_json()
    user_id = data.get('id')

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found!"}), 404

    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        return jsonify({"error": "Admin role not found in the database."}), 500

    user_roles = (
        db.session.query(Role.name)
        .join(UserRole, Role.role_id == UserRole.role_id)
        .filter(UserRole.user_id == user_id)
        .all()
    )
    user_roles = [role[0] for role in user_roles]
    if 'admin' in user_roles:
        return jsonify({"error": f"User {user.email} is already an admin."}), 400

    new_user_role = UserRole(user_id=user_id, role_id=admin_role.role_id)
    db.session.add(new_user_role)
    db.session.commit()

    return jsonify({"message": f"User {user.email} has been granted admin privileges."}), 200


@admin_bp.route('/api/admin/unaccepted-users', methods=['GET'])
@token_required
def get_unaccepted_users(current_user):

    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    unaccepted_users = User.query.filter_by(is_accepted=False).all()

    user_data = [
        {
            "user_id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        for user in unaccepted_users
    ]

    return jsonify({"unaccepted_users": user_data}), 200


@admin_bp.route('/api/admin/accept-user', methods=['PUT'])
@token_required
def accept_user(current_user):

    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    data = request.get_json()
    user_id = data.get('user_id')

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found!"}), 404

    user.is_accepted = True
    db.session.commit()

    return jsonify({"message": f"User {user.email} has been accepted."}), 200


@admin_bp.route('/api/admin/delete-user/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):

    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found!"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": f"User {user.email} has been deleted."}), 200



# Helper function for authentication
def is_user_admin(user_id):
    user_roles = (
        db.session.query(Role.name)
        .join(UserRole, Role.role_id == UserRole.role_id)
        .filter(UserRole.user_id == user_id)
        .all()
    )
    user_roles = [role[0] for role in user_roles]
    return 'admin' in user_roles
