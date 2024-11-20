from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from models.auth_model import User, Child, ParentChildLink
from models.carpool_model import Carpool
from routes.auth import token_required
import socketio

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


# Mark notifications as read
@notifications_bp.route('/api/notifications/mark-read', methods=['POST'])
@token_required
def mark_single_notification_as_read(current_user):
    try:
        # Logga inkommande data
        print(f"Current user: {current_user.user_id}, Received JSON body: {request.json}")
        notification_id = request.json.get('id')

        if not notification_id:
            return jsonify({"error": "No notification ID provided"}), 400

        # Hitta notifikationen och markera den som läst
        notification = Notification.query.filter_by(id=notification_id, user_id=current_user.user_id).first()
        if notification:
            print(f"Notification found: {notification.id} for user {current_user.user_id}")
            notification.is_read = True
            db.session.commit()
            return jsonify({"message": f"Notification {notification_id} marked as read"}), 200

        # Logga om notifikationen inte hittades
        print(f"Notification not found or unauthorized for user {current_user.user_id}")
        return jsonify({"error": "Notification not found or unauthorized"}), 404
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

