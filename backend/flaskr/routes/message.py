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
from models.activity_model import Activity

message_bp = Blueprint('message_bp', __name__)
active_users = {}

def create_notification(user_id, carpool_id, message, message_id=None):
    """Creates a notification for a user about a carpool message."""
    notification = Notification(
        user_id=user_id,
        carpool_id=carpool_id,
        message_id=message_id,
        message=message,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.session.add(notification)
    db.session.commit()

    # Kontrollera om vi behöver query
    created_notification = Notification.query.filter_by(
        user_id=user_id, 
        carpool_id=carpool_id, 
        message_id=message_id,
        message=message
    ).order_by(Notification.created_at.desc()).first()

    return notification

# Helper function to notify users in a carpool
def notify_users_in_carpool(carpool_id, message, sender_id, message_id):
    # Initiera active_users om det saknas
    if carpool_id not in active_users:
        active_users[carpool_id] = set()

    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        print(f"Carpool {carpool_id} not found.")
        return

    notified_users = set()  # För att undvika dubblerade notifieringar

    # Hämta bilinformation (om det finns)
    car_info = f"{carpool.car.model_name}" if carpool.car else "Ingen bil tilldelad"

    # Hämta övergripande information om carpoolen
    carpool_details = {
        "carpool_id": carpool.id,
        "carpool_type": carpool.carpool_type,
        "available_seats": carpool.available_seats,
        "departure_address": carpool.departure_address,
        "departure_city": carpool.departure_city,
        "departure_postcode": carpool.departure_postcode,
        "car_info": car_info,
    }

    # Notify the carpool driver if they are not the sender or active
    if carpool.driver_id != sender_id and carpool.driver_id not in active_users[carpool_id]:
        if carpool.driver_id not in notified_users:
            notification = create_notification(
                user_id=carpool.driver_id, carpool_id=carpool_id, message=message, message_id=message_id
            )
            socketio.emit(
                'notification',
                {
                    'id': notification.id,
                    'message': message,
                    'carpool_details': carpool_details,
                    'user_id': carpool.driver_id
                },
                room=f'user_{carpool.driver_id}'
            )
            notified_users.add(carpool.driver_id)

    # Notify parents of passengers if they are not active
    for passenger in carpool.passengers:
        parent_links = ParentChildLink.query.filter_by(child_id=passenger.child_id).all()
        for parent_link in parent_links:
            if parent_link.user_id != sender_id and parent_link.user_id not in active_users[carpool_id]:
                if parent_link.user_id not in notified_users:
                    notification = create_notification(
                        user_id=parent_link.user_id, carpool_id=carpool_id, message=message, message_id=message_id
                    )
                    socketio.emit(
                        'notification',
                        {
                            'id': notification.id,
                            'message': message,
                            'carpool_details': carpool_details,
                            'user_id': parent_link.user_id
                        },
                        room=f'user_{parent_link.user_id}'
                    )
                    notified_users.add(parent_link.user_id)

    print(f"Notified users for carpool {carpool_id}: {notified_users}")


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
    carpool_id = data.get('carpool_id')
    user_id = data.get('user_id')
    if not carpool_id or not user_id:
        emit('error', {'error': 'Carpool ID and User ID are required to join the room.'}, room=request.sid)
        return

    join_room(f'carpool_{carpool_id}')
    if carpool_id not in active_users:
        active_users[carpool_id] = set()
    active_users[carpool_id].add(user_id)

@socketio.on('leave_carpool')
def handle_leave_carpool(data):
    carpool_id = data.get('carpool_id')
    user_id = data.get('user_id')
    if not carpool_id or not user_id:
        emit('error', {'error': 'Carpool ID and User ID are required to leave the room.'}, room=request.sid)
        return

    leave_room(f'carpool_{carpool_id}')
    if carpool_id in active_users:
        active_users[carpool_id].discard(user_id)
        if not active_users[carpool_id]:  # Rensa tomma rum
            del active_users[carpool_id]

@socketio.on('join_user')
def handle_join_user_room(data):
    user_id = data.get('user_id')
    if not user_id:
        emit('error', {'error': 'User ID is required to join personal room.'})
        return

    # Lägg till användaren i deras personliga notisrum
    join_room(f'user_{user_id}')
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

    # Hämta `activity_id` från `Carpool`
    carpool = db.session.query(Carpool).filter_by(id=carpool_id).first()
    if not carpool:
        emit('error', {'error': 'Carpool not found.'}, room=request.sid)
        return

    # Hämta `address` från `Activity` baserat på `activity_id`
    activity = db.session.query(Activity).filter_by(activity_id=carpool.activity_id).first()
    activity_address = activity.address if activity else "okänd destination"

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

    # Skapa och skicka notifikation
    notification_message = f"Nytt meddelande i samåkning till {activity_address} från {sender.first_name} {sender.last_name}"
    notify_users_in_carpool(carpool_id, notification_message, message.sender_id, message.id)



