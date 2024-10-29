from flask import Blueprint, request, jsonify
from extensions import db, socketio
from models.message_model import CarpoolMessage
from flask_socketio import join_room, leave_room, emit
from routes.auth import token_required  # Om token_required krävs för autentisering
from datetime import datetime

message_bp = Blueprint('message_bp', __name__)

# Endpoint för att hämta meddelanden i en carpool
@message_bp.route('/api/carpool/<int:carpool_id>/messages', methods=['GET'])
@token_required
def get_carpool_messages(current_user, carpool_id):
    """Hämtar historiska meddelanden för en given carpool."""
    messages = CarpoolMessage.query.filter_by(carpool_id=carpool_id).order_by(CarpoolMessage.timestamp.asc()).all()
    return jsonify([{
        'id': msg.id,
        'sender_id': msg.sender_id,
        'content': msg.content,
        'timestamp': msg.timestamp,
        'status': msg.status
    } for msg in messages]), 200

# Endpoint för att skicka meddelande
@message_bp.route('/api/carpool/<int:carpool_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, carpool_id):
    """Skickar ett nytt meddelande till en carpool-chatt."""
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({"error": "Message content is required!"}), 400

    message = CarpoolMessage(
        sender_id=current_user.user_id,
        carpool_id=carpool_id,
        content=content,
        status='sent'
    )
    
    db.session.add(message)
    db.session.commit()

    # Emit message to WebSocket subscribers
    socketio.emit('new_message', {
        'carpool_id': carpool_id,
        'message': {
            'id': message.id,
            'sender_id': message.sender_id,
            'content': message.content,
            'timestamp': message.timestamp.isoformat()
        }
    }, room=f'carpool_{carpool_id}')

    return jsonify({"message": "Message sent successfully!"}), 201

# Socket.IO-händelsehanterare för anslutning, chattrum och meddelanden
@socketio.on('join_carpool')
def handle_join_carpool(data):
    
    join_room(f'carpool_{1}')
    emit('join_success', {'message': f'Joined carpool {1} chat'}, room=request.sid)

@socketio.on('leave_carpool')
def handle_leave_carpool(data):
    """Kopplar bort användaren från en carpool-chatt."""
    carpool_id = data.get('carpool_id')
    if carpool_id is None:
        emit('error', {'error': 'Carpool ID is required to leave the room.'}, room=request.sid)
        return

    leave_room(f'carpool_{carpool_id}')
    emit('leave_success', {'message': f'Left carpool {carpool_id} chat'}, room=f'carpool_{carpool_id}')


@socketio.on('send_message')
def handle_send_message(data):
    carpool_id = 1
    content = data.get('content')
    sender_id = data.get('sender_id')

    if not content:
        emit('error', {'error': 'Message content is required!'}, room=request.sid)
        return

    # Spara meddelandet i databasen
    message = CarpoolMessage(
        sender_id=sender_id,
        carpool_id=carpool_id,
        content=content,
        timestamp=datetime.utcnow(),
        status='sent'
    )
    
    db.session.add(message)
    db.session.commit()

    print("BACKEND BACKEND BACKEND" + message.content + "BACKEND BACKEND BACKEND")
    # Skicka meddelandet till alla anslutna klienter i rummet
    emit('new_message', {
        'carpool_id': carpool_id,
        'message': {
            'id': message.id,
            'sender_id': message.sender_id,
            'content': message.content,
            'timestamp': message.timestamp.isoformat()
        }
    }, room=f'carpool_{carpool_id}')
