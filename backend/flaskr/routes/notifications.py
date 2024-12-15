from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from routes.auth import token_required
from models.carpool_model import Carpool, Car
from routes.message import email_notifications_sent
from flask_socketio import emit
from models.activity_model import Activity
from models.auth_model import User, Child, ParentChildLink, Role

notifications_bp = Blueprint('notifications_bp', __name__)

role_mapping = {
    'vårdnadshavare': 1,
    'ledare': 2,
    'kutar': 3,
    'tumlare': 4,
    'upptäckare': 5,
    'äventyrare': 6,
    'utmanare': 7,
    'rover': 8,
    'vuxenscout': 10
}

@notifications_bp.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    limit = request.args.get('limit', default=None, type=int)
    query = Notification.query.filter_by(user_id=current_user.user_id).order_by(Notification.created_at.desc())
    
    if limit:
        query = query.limit(limit)
    
    notifications = query.all()

    notifications_data = []
    for n in notifications:
        carpool = Carpool.query.get(n.carpool_id)
        activity = Activity.query.get(carpool.activity_id) if carpool else None  
        car = Car.query.get(carpool.car_id)

        scout_level_name = None
        if activity:
            role = Role.query.get(activity.role_id)
            scout_level_name = role.name if role else None

        passengers = []
        for passenger in carpool.passengers:
            # Hantera om passageraren är ett barn
            if passenger.child_id:
                child = Child.query.get(passenger.child_id)
                if child:
                    # Hämta föräldrar från ParentChildLink
                    parent_links = ParentChildLink.query.filter_by(child_id=child.child_id).all()
                    parents = [
                        {
                            "parent_id": parent.user_id,
                            "parent_name": f"{User.query.get(parent.user_id).first_name} {User.query.get(parent.user_id).last_name}",
                            "parent_phone": User.query.get(parent.user_id).phone
                        }
                        for parent in parent_links
                    ]
                    passengers.append({
                        "type": "child",
                        "child_id": child.child_id,
                        "name": f"{child.first_name} {child.last_name}",
                        "phone": child.phone,
                        "parents": parents
                    })

            # Hantera om passageraren är en användare
            elif passenger.user_id:
                user = User.query.get(passenger.user_id)
                if user:
                    passengers.append({
                        "type": "user",
                        "user_id": user.user_id,
                        "name": f"{user.first_name} {user.last_name}",
                        "phone": user.phone
                    })

        carpool_details = {
            "id": carpool.id,
            "driver_id": carpool.driver_id,
            "car_id": carpool.car_id,
            "car_model_name": car.model_name if car else "Ingen bil tilldelad",
            "available_seats": carpool.available_seats,
            "departure_address": carpool.departure_address,
            "departure_postcode": carpool.departure_postcode,
            "departure_city": carpool.departure_city,
            "carpool_type": carpool.carpool_type,
            "passengers": passengers
        } if carpool else None

        activity_details = {
            "activity_id": activity.activity_id,
            "summary": activity.name,
            "dtstart": activity.start_date.isoformat(),
            "dtend": activity.end_date.isoformat() if activity.end_date else None,
            "location": activity.address,
            "description": activity.description,
            "scout_level": list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]
            if activity.role_id in role_mapping.values() else None
        } if activity else None

        notification_type = "chat" if n.message_id else "passenger"

        notifications_data.append({
            "id": n.id,
            "message": n.message,
            "carpool_details": carpool_details,
            "activity_details": activity_details,  
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "type": notification_type,  # Lägg till typ
        })

    unread_count = sum(1 for n in notifications if not n.is_read)
    return jsonify({"notifications": notifications_data, "unreadCount": unread_count}), 200



@notifications_bp.route('/api/notifications/mark-read', methods=['POST'])
@token_required
def mark_notifications_as_read(current_user):
    try:
        # Ta emot payload
        carpool_id = request.json.get('carpool_id')
        notif_type = request.json.get('type') 

        if not carpool_id or not notif_type:
            return jsonify({"error": "Carpool ID and type are required"}), 400

        if notif_type not in ['chat', 'passenger']:
            return jsonify({"error": "Invalid type provided"}), 400

        # Filtrera notifikationer baserat på type
        query = Notification.query.filter_by(
            carpool_id=carpool_id,
            user_id=current_user.user_id,
            is_read=False
        )
        query = query.filter(Notification.message_id.isnot(None) if notif_type == 'chat' else Notification.message_id.is_(None))

        notifications = query.all()

        if not notifications:
            return jsonify({"message": f"No unread {notif_type} notifications found"}), 200

        # Markera alla notifikationer som lästa
        query.update({'is_read': True}, synchronize_session=False)
        db.session.commit()

        reset_email_notification_flag(current_user.user_id, carpool_id)
        delete_read_notifications(current_user.user_id, carpool_id, notif_type)

        # Skicka socket-event
        emit(
            'update_notifications',
            {
                'message': f"{notif_type.capitalize()} notifications updated",
                'carpool_id': carpool_id,
                'type': notif_type
            },
            room=f"user_{current_user.user_id}",
            namespace='/'
        )

        return jsonify({"message": f"All {notif_type} notifications for carpool {carpool_id} marked as read"}), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


def delete_read_notifications(user_id, carpool_id=None, notif_type=None):
    # Local helper function
    try:
        query = Notification.query.filter_by(user_id=user_id, is_read=True)
        if carpool_id:
            query = query.filter_by(carpool_id=carpool_id)

        # Filtrera baserat på type
        if notif_type == 'message':
            query = query.filter(Notification.message_id.isnot(None))  # Endast med message_id
        elif notif_type == 'passenger':
            query = query.filter(Notification.message_id.is_(None))  # Endast utan message_id

        # Hämta och radera alla matchande notifikationer
        notifications_to_delete = query.all()
        if notifications_to_delete:
            for notification in notifications_to_delete:
                db.session.delete(notification)
            db.session.commit()

    except Exception as e:
        print(f"Error deleting read notifications: {str(e)}")


def reset_email_notification_flag(user_id, carpool_id):
    """Nollställer email_notifications_sent-flaggan för användaren och samåkningen."""
    if user_id in email_notifications_sent:
        if carpool_id in email_notifications_sent[user_id]:
            del email_notifications_sent[user_id][carpool_id]

        # Ta bort användaren från email_notifications_sent om alla carpools har tagits bort
        if not email_notifications_sent[user_id]:
            del email_notifications_sent[user_id]

