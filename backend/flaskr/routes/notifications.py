from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from routes.auth import token_required

notifications_bp = Blueprint('notifications_bp', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    # Hämta alla notifikationer för användaren, sorterade efter senaste
    limit = request.args.get('limit', default=None, type=int)
    query = Notification.query.filter_by(user_id=current_user.user_id).order_by(Notification.created_at.desc())
    
    if limit:
        query = query.limit(limit)
    
    notifications = query.all()

    # Format notifications och räkna olästa
    notifications_data = [
        {
            "id": n.id,
            "message": n.message,
            "carpool_id": n.carpool_id,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        } for n in notifications
    ]
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

            return jsonify({"message": f"All notifications for carpool {carpool_id} marked as read"}), 200

        # Logga om inga notifikationer hittades
        print(f"No unread notifications found for carpool {carpool_id} and user {current_user.user_id}")
        return jsonify({"error": "No unread notifications found"}), 404
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


