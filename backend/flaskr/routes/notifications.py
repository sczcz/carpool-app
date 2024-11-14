from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification
from models.auth_model import User, Child, ParentChildLink
from models.carpool_model import Carpool
from routes.auth import token_required
import socketio

notifications_bp = Blueprint('notifications_bp', __name__)

# Fetch notifications for the logged-in user
@notifications_bp.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    # Fetch all notifications for the user
    notifications = Notification.query.filter_by(user_id=current_user.user_id).all()
    
    # Format notifications and count unread ones
    notifications_data = [
        {
            "id": n.id,
            "message": n.message,
            "carpool_id": n.carpool_id,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifications
    ]
    unread_count = sum(1 for n in notifications if not n.is_read)

    return jsonify({"notifications": notifications_data, "unreadCount": unread_count}), 200

# Mark notifications as read
@notifications_bp.route('/api/notifications/mark-read', methods=['POST'])
@token_required
def mark_notifications_as_read(current_user):
    notification_ids = request.json.get('notification_ids', [])
    
    if not notification_ids:
        return jsonify({"error": "No notification IDs provided"}), 400

    # Mark each notification as read
    for notification_id in notification_ids:
        notification = Notification.query.filter_by(id=notification_id, user_id=current_user.user_id).first()
        if notification:
            notification.is_read = True

    db.session.commit()
    return jsonify({"message": "Notifications marked as read"}), 200

# Helper function to create a new notification
def create_notification(user_id, carpool_id, message):
    new_notification = Notification(
        user_id=user_id,
        carpool_id=carpool_id,
        message=message
    )
    db.session.add(new_notification)
    db.session.commit()

# This function should be called when a new message is sent in a carpool chat
def notify_users_in_carpool(carpool_id, message):
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return

    # Notify the carpool creator
    socketio.emit('notification', {
    'carpool_id': carpool_id,
    'message': message,
    'user_id': carpool.driver_id
    })
    print(f"Sent notification to user {carpool.driver_id} for carpool {carpool_id}")


    # Notify parents of all passengers in the carpool
    for passenger in carpool.passengers:
        child = Child.query.get(passenger.child_id)
        if child:
            parent_links = ParentChildLink.query.filter_by(child_id=child.child_id).all()
            for parent_link in parent_links:
                socketio.emit('notification', {
                    'carpool_id': carpool_id,
                    'message': message,
                    'user_id': parent_link.user_id
                })

# This example assumes you call `notify_users_in_carpool` in your Socket.IO chat message handling
