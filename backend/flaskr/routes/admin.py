from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.auth_model import User, Role, UserRole, ParentChildLink, Child
from models.activity_model import Activity
from models.carpool_model import Car
from routes.auth import token_required
from models.carpool_model import Carpool, Passenger
from models.message_model import CarpoolMessage
from models.notifications_model import Notification
import datetime

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
            "id": user.user_id,
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

    try:
        # Ta bort notiser kopplade till användaren
        notifications = Notification.query.filter_by(user_id=user_id).all()
        for notification in notifications:
            db.session.delete(notification)

        # Ta bort alla samåkningar som användaren har skapat
        carpools = Carpool.query.filter_by(driver_id=user_id).all()
        for carpool in carpools:
            # Ta bort passagerare kopplade till carpoolen
            Passenger.query.filter_by(carpool_id=carpool.id).delete()

            # Ta bort meddelanden kopplade till carpoolen
            CarpoolMessage.query.filter_by(carpool_id=carpool.id).delete()

            # Ta bort själva carpoolen
            db.session.delete(carpool)

        # Ta bort alla länkar mellan användaren och barn
        child_links = ParentChildLink.query.filter_by(user_id=user_id).all()
        for link in child_links:
            db.session.delete(link)

            # Kontrollera om barnet inte längre är länkat till någon annan användare
            remaining_links = ParentChildLink.query.filter_by(child_id=link.child_id).all()
            if not remaining_links:
                child = Child.query.get(link.child_id)
                if child:
                    db.session.delete(child)

        #Ta bort sparade bilar
        cars = Car.query.filter_by(owner_id=user_id).all()
        for car in cars:
             db.session.delete(car)

        # Ta bort själva användaren
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": f"Användare {user.email} och dess data har raderats."}), 200

    except Exception as e:
        db.session.rollback()  # Återställ ändringar om något går fel
        current_app.logger.error(f"Error deleting user {user_id}: {e}")
        return jsonify({"error": "An error occurred while deleting the user."}), 500



@admin_bp.route('/api/admin/cleanup-activities', methods=['DELETE'])
@token_required
def cleanup_activities(current_user):

    if not is_user_admin(current_user.user_id):
        return jsonify({"error": "Access denied!"}), 403

    try:
        now = datetime.datetime.utcnow()
        three_months_ago = now - datetime.timedelta(days=90)

        # Hämta aktiviteter att rensa
        activities_to_delete = Activity.query.filter(
            db.or_(
                Activity.end_date < now,
                db.and_(
                    Activity.end_date.is_(None),
                    Activity.start_date < three_months_ago
                )
            )
        ).all()

        # Hämta IDs för aktiviteter som ska tas bort
        activity_ids_to_delete = [activity.activity_id for activity in activities_to_delete]

        # Hämta och ta bort relaterade samåkningar
        carpools_to_delete = Carpool.query.filter(Carpool.activity_id.in_(activity_ids_to_delete)).all()
        carpool_ids_to_delete = [carpool.id for carpool in carpools_to_delete]

        # Ta bort relaterade passagerare
        passengers_to_delete = Passenger.query.filter(Passenger.carpool_id.in_(carpool_ids_to_delete)).all()

        # Räkna antal poster för att logga senare
        deleted_activities_count = len(activities_to_delete)
        deleted_carpools_count = len(carpools_to_delete)
        deleted_passengers_count = len(passengers_to_delete)

        # Ta bort poster från databasen
        for passenger in passengers_to_delete:
            db.session.delete(passenger)

        for carpool in carpools_to_delete:
            db.session.delete(carpool)

        for activity in activities_to_delete:
            db.session.delete(activity)

        db.session.commit()

        return jsonify({
            "message": f"Rensning klar.",
            "deleted_activities": deleted_activities_count,
            "deleted_carpools": deleted_carpools_count,
            "deleted_passengers": deleted_passengers_count
        }), 200

    except Exception as e:
        current_app.logger.error(f"Fel vid rensning av aktiviteter: {e}")
        db.session.rollback()  # Återställ databasen om något går fel
        return jsonify({"error": "Ett fel inträffade vid rensning av aktiviteter."}), 500


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
