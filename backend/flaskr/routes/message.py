from flask import Blueprint, request, jsonify
from extensions import db, socketio
from models.message_model import CarpoolMessage
from models.auth_model import User, ParentChildLink, Child
from models.notifications_model import Notification
from flask_socketio import join_room, leave_room, emit
from routes.auth import token_required
from routes.carpool import Carpool, Passenger
from datetime import datetime
from dateutil import tz

message_bp = Blueprint('message_bp', __name__)

def create_notification(user_id, carpool_id, message):
    """Creates a notification for a user about a carpool message."""
    notification = Notification(
        user_id=user_id,
        carpool_id=carpool_id,
        message=message,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.session.add(notification)
    db.session.commit()

# Helper function to notify users in a carpool
def notify_users_in_carpool(carpool_id, message, sender_id):
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        print(f"Carpool {carpool_id} not found.")
        return

    print(f"Notifying users in carpool {carpool_id} with message: {message}")

    # Notify the carpool creator if they are not the sender
    if carpool.driver_id != sender_id:
        print(f"Notifying driver {carpool.driver_id}")
        create_notification(carpool.driver_id, carpool_id, message)
        socketio.emit('notification', {
            'carpool_id': carpool_id,
            'message': message,
            'user_id': carpool.driver_id
        }, room=f'user_{carpool.driver_id}')

    # Notify parents of all passengers in the carpool, excluding the sender
    for passenger in carpool.passengers:
        child = Child.query.get(passenger.child_id)
        if child:
            parent_links = ParentChildLink.query.filter_by(child_id=child.child_id).all()
            for parent_link in parent_links:
                if parent_link.user_id != sender_id:
                    print(f"Notifying parent {parent_link.user_id}")
                    create_notification(parent_link.user_id, carpool_id, message)
                    socketio.emit('notification', {
                        'carpool_id': carpool_id,
                        'message': message,
                        'user_id': parent_link.user_id
                    }, room=f'user_{parent_link.user_id}')



@message_bp.route('/api/carpool/<int:carpool_id>/messages', methods=['GET'])
@token_required
def get_carpool_messages(current_user, carpool_id):
    """Hämtar historiska meddelanden för en given carpool, inklusive användarens namn."""
    messages = (
        db.session.query(CarpoolMessage, User)
        .join(User, CarpoolMessage.sender_id == User.user_id)
        .filter(CarpoolMessage.carpool_id == carpool_id)
        .order_by(CarpoolMessage.timestamp.asc())
        .all()
    )
    
    # Skapa en lista med alla meddelanden och relevant användarinformation
    messages_data = [{
        'id': msg.CarpoolMessage.id,
        'sender_id': msg.CarpoolMessage.sender_id,
        'sender_name': f"{msg.User.first_name} {msg.User.last_name}",  # Kombinerar för- och efternamn
        'content': msg.CarpoolMessage.content,
        'timestamp': msg.CarpoolMessage.timestamp,
        'status': msg.CarpoolMessage.status
    } for msg in messages]

    return jsonify(messages_data), 200


# Socket.IO-händelsehanterare för anslutning, chattrum och meddelanden
@socketio.on('join_carpool')
def handle_join_carpool(data):
    """Prenumererar användaren på en carpool-chatt baserat på carpool_id."""
    carpool_id = data.get('carpool_id')
    if carpool_id is None:
        emit('error', {'error': 'Carpool ID is required to join the room.'}, room=request.sid)
        return

    join_room(f'carpool_{carpool_id}')
    print('join success, message: Joined carpool {carpool_id} chat')
    emit('join_success', {'message': f'Joined carpool {carpool_id} chat'}, room=request.sid)

@socketio.on('leave_carpool')
def handle_leave_carpool(data):
    """Kopplar bort användaren från en carpool-chatt."""
    carpool_id = data.get('carpool_id')
    if carpool_id is None:
        emit('error', {'error': 'Carpool ID is required to leave the room.'}, room=request.sid)
        return

    leave_room(f'carpool_{carpool_id}')
    emit('leave_success', {'message': f'Left carpool {carpool_id} chat'}, room=f'carpool_{carpool_id}')

@socketio.on('join_user')
def handle_join_user_room(data):
    user_id = data.get('user_id')
    if not user_id:
        emit('error', {'error': 'User ID is required to join personal room.'})
        return

    # Lägg till användaren i deras personliga notisrum
    join_room(f'user_{user_id}')
    print(f"User {user_id} joined their personal notification room: user_{user_id}")

    emit('join_success', {'message': f'Joined personal notification room for user {user_id}'})

@socketio.on('send_message')
def handle_send_message(data):
    """Hantera meddelanden i realtid."""
    carpool_id = data.get('carpool_id')
    content = data.get('content')
    sender_id = data.get('sender_id')

    if not carpool_id:
        emit('error', {'error': 'Carpool ID is required to send a message.'}, room=request.sid)
        return
    if not content:
        emit('error', {'error': 'Message content is required!'}, room=request.sid)
        return

    # Hämta användaren för att inkludera namnet i meddelandet
    sender = User.query.get(sender_id)
    if not sender:
        emit('error', {'error': 'Sender not found.'}, room=request.sid)
        return
    
    # Define timezone conversion
    from_zone = tz.tzutc()
    to_zone = tz.tzlocal()  # This converts to the server's local timezone

    # Get UTC time for the message
    utc_timestamp = datetime.utcnow()
    utc_timestamp = utc_timestamp.replace(tzinfo=from_zone)  # Mark it as UTC
    
    # Convert UTC timestamp to local time
    local_timestamp = utc_timestamp.astimezone(to_zone)

    # Spara meddelandet i databasen med UTC-tid
    message = CarpoolMessage(
        sender_id=sender_id,
        carpool_id=carpool_id,
        content=content,
        timestamp=utc_timestamp,  # Still saving in UTC to the database
        status='sent'
    )
    
    db.session.add(message)
    db.session.commit()

    # Skicka meddelandet till alla anslutna klienter i rummet
    emit('new_message', {
        'carpool_id': carpool_id,
        'message': {
            'id': message.id,
            'sender_id': message.sender_id,
            'sender_name': f"{sender.first_name} {sender.last_name}",
            'content': message.content,
            'timestamp': local_timestamp.isoformat()  # Sending local time to clients
        }
    }, room=f'carpool_{carpool_id}')

    notification_message = f"Nytt meddelande i samåkning {carpool_id} from {sender.first_name} {sender.last_name}"
    notify_users_in_carpool(carpool_id, notification_message, message.sender_id)