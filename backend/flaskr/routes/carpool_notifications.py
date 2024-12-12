import json
from extensions import db
from models.carpool_model import Carpool
from models.auth_model import User
from routes.mail import mail
from flask_mail import Message
from flask_socketio import emit
from models.notifications_model import Notification
from datetime import datetime

def send_passenger_list_notification(carpool_id, action, current_user):

    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        print(f"Carpool {carpool_id} not found.")
        return

    # Hämta föraren (skaparen av carpoolen)
    driver = User.query.get(carpool.driver_id)
    if not driver or not driver.email:
        print(f"Driver for carpool {carpool_id} not found or has no email.")
        return
    
    message = f"{current_user.first_name} {current_user.last_name} har {'lagt till' if action == 'added' else 'tagit bort'} en passagerare."

    # Skapa notis i databasen
    notification = Notification(
        user_id=driver.user_id,
        carpool_id=carpool_id,
        message=message,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.session.add(notification)
    db.session.commit()

    # Skicka notis via Socket.IO
    emit(
        'notification',
        {
            "message": message,
            "carpool_details": {
                "carpool_id": carpool_id,
                "carpool_type": carpool.carpool_type,
                "available_seats": carpool.available_seats,
                "departure_address": carpool.departure_address,
                "departure_city": carpool.departure_city,
            },
            "user_name": current_user.first_name,
            "id": notification.id,
            "type": "passenger"
        },
        to=f"user_{driver.user_id}", namespace='/'
    )

    # Kontrollera om föraren har aktiverat notiser för passagerarlistan
    if driver.notification_preferences:
        notification_preferences = json.loads(driver.notification_preferences)
    else:
        notification_preferences = {}

    if not notification_preferences.get("passenger_notifications", False):
        print(f"Driver {driver.email} has disabled passenger list notifications. Skipping.")
        return

    # Skapa ett e-postmeddelande baserat på åtgärden
    if action == "added":
        subject = f"Ny passagerare i din samåkning {carpool_id}"
        body = f"Hej {driver.first_name},\n\nEn ny passagerare har lagts till i din samåkning.\n\nHälsningar, Redo-supporten."
        html_body = f"""
            <p>Hej {driver.first_name},</p>
            <p>En ny passagerare har lagts till i din samåkning.</p>
            <p>Hälsningar, Redo-supporten.</p>
        """
    elif action == "removed":
        subject = f"Passagerare borttagen från din samåkning {carpool_id}"
        body = f"Hej {driver.first_name},\n\nEn passagerare har tagits bort från din samåkning av {current_user.first_name} {current_user.last_name}.\n\nHälsningar, Redo-supporten."
        html_body = f"""
            <p>Hej {driver.first_name},</p>
            <p>En passagerare har tagits bort från din samåkning av {current_user.first_name} {current_user.last_name}.</p>
            <p>Hälsningar, Redo-supporten.</p>
        """
    else:
        print(f"Unknown action: {action}. No notification sent.")
        return

    # Skicka e-post
    try:
        with mail.connect() as conn:
            msg = Message(subject=subject, recipients=[driver.email], body=body, sender="redo@kustscoutjonstorp.se")
            msg.html = html_body
            conn.send(msg)
        print(f"Passenger list notification sent to {driver.email} for action {action}.")
    except Exception as e:
        print(f"Error sending passenger list notification: {e}")
