from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from routes.auth import token_required
from models.carpool_model import Carpool

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
        carpool_details = {
            "carpool_id": carpool.id,
            "carpool_type": carpool.carpool_type,
            "available_seats": carpool.available_seats,
            "departure_address": carpool.departure_address,
            "departure_city": carpool.departure_city,
            "departure_postcode": carpool.departure_postcode,
            "car_info": f"{carpool.car.model_name}" if carpool.car else "Ingen bil tilldelad",
        } if carpool else None

        notifications_data.append({
            "id": n.id,
            "message": n.message,
            "carpool_details": carpool_details,
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
        # Logga inkommande data
        print(f"Current user: {current_user.user_id}, Received JSON body: {request.json}")
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

            delete_read_notifications(current_user.user_id, carpool_id)

            return jsonify({"message": f"All notifications for carpool {carpool_id} marked as read"}), 200

        # Logga om inga notifikationer hittades
        print(f"No unread notifications found for carpool {carpool_id} and user {current_user.user_id}")
        return jsonify({"error": "No unread notifications found"}), 404
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



