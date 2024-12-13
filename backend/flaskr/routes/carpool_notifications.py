import json
from extensions import db
from models.carpool_model import Carpool
from models.auth_model import User, Child, ParentChildLink
from models.activity_model import Activity
from models.carpool_model import Car
from routes.mail import mail
from flask_mail import Message
from flask_socketio import emit
from models.notifications_model import Notification
from datetime import datetime
from routes.message import email_notifications_sent

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
    
    if current_user.user_id == driver.user_id:
        return

    # Hämta aktivitet kopplad till carpoolen
    activity = Activity.query.get(carpool.activity_id) if carpool.activity_id else None

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

    car = Car.query.get(carpool.car_id)
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

    # Förbered data för emit
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
    }

    activity_details = {
        "activity_id": activity.activity_id,
        "location": activity.address,
        "summary": activity.name,
        "dtstart": activity.start_date.isoformat(),
    } if activity else None

    # Skicka notis via Socket.IO
    emit(
        'notification',
        {
            "id": notification.id,
            "message": message,
            "carpool_details": carpool_details,
            "activity_details": activity_details,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
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
