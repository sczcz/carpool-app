from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from routes.auth import token_required
from models.carpool_model import Carpool
from routes.message import email_notifications_sent
from flask_socketio import emit
from models.activity_model import Activity

notifications_bp = Blueprint('notifications_bp', __name__)

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
        activity = Activity.query.get(carpool.activity_id) if carpool else None  # Hämta aktivitet för carpool
        
        carpool_details = {
            "carpool_id": carpool.id,
            "carpool_type": carpool.carpool_type,
            "available_seats": carpool.available_seats,
            "departure_address": carpool.departure_address,
            "departure_city": carpool.departure_city,
            "departure_postcode": carpool.departure_postcode,
            "car_info": f"{carpool.car.model_name}" if carpool.car else "Ingen bil tilldelad",
        } if carpool else None

        activity_details = {
            "activity_id": activity.activity_id,
            "location": activity.address,
            "summary": activity.name,
            "dtstart": activity.start_date.isoformat(),
        } if activity else None

        notifications_data.append({
            "id": n.id,
            "message": n.message,
            "carpool_details": carpool_details,
            "activity_details": activity_details,  # Lägg till aktivitetsdata
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        })

    unread_count = sum(1 for n in notifications if not n.is_read)
    return jsonify({"notifications": notifications_data, "unreadCount": unread_count}), 200




# Mark notifications for a carpool as read
@notifications_bp.route('/api/notifications/mark-read', methods=['POST'])
@token_required
def mark_notifications_as_read(current_user):
    try:
        carpool_id = request.json.get('carpool_id')

        if not carpool_id:
            return jsonify({"error": "No carpool ID provided"}), 400

        # Hitta alla notifikationer för det angivna carpool_id och användaren
        notifications = Notification.query.filter_by(
            carpool_id=carpool_id,
            user_id=current_user.user_id,
            is_read=False  # Endast olästa notifikationer
        ).all()

        if notifications:
            # Markera alla notifikationer som lästa
            for notification in notifications:
                notification.is_read = True
            db.session.commit()

            reset_email_notification_flag(current_user.user_id, carpool_id)
            delete_read_notifications(current_user.user_id, carpool_id)

            # Skicka socket-event till frontend för att uppdatera notiser
            emit('update_notifications', {'message': 'Notifications updated'}, room=f"user_{current_user.user_id}", namespace='/')

            return jsonify({"message": f"All notifications for carpool {carpool_id} marked as read"}), 200

        # Logga om inga notifikationer hittades
        return jsonify({"message": "No unread notifications found"}), 200
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

    
    
def delete_read_notifications(user_id, carpool_id=None):
    #Local helper function
    try:
        query = Notification.query.filter_by(user_id=user_id, is_read=True)
        if carpool_id:
            query = query.filter_by(carpool_id=carpool_id)

        # Hämta och radera alla matchande notifikationer
        notifications_to_delete = query.all()
        if notifications_to_delete:
            for notification in notifications_to_delete:
                db.session.delete(notification)
            db.session.commit()

        print(f"Deleted {len(notifications_to_delete)} read notifications for user {user_id} and carpool {carpool_id}")
    except Exception as e:
        print(f"Error deleting read notifications: {str(e)}")

def reset_email_notification_flag(user_id, carpool_id):
    """Nollställer email_notifications_sent-flaggan för användaren och samåkningen."""
    if user_id in email_notifications_sent:
        if carpool_id in email_notifications_sent[user_id]:
            del email_notifications_sent[user_id][carpool_id]
            print(f"Email notification flag reset for user {user_id} and carpool {carpool_id}")

        # Ta bort användaren från email_notifications_sent om alla carpools har tagits bort
        if not email_notifications_sent[user_id]:
            del email_notifications_sent[user_id]

