from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
import requests
from icalendar import Calendar, Event
from routes.auth import token_required
import sys
from models.auth_model import Child, Role, ParentChildLink, UserRole, User
from models.activity_model import Activity
from models.carpool_model import Passenger, Carpool
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(encoding='utf-8')

activity_bp = Blueprint('activity', __name__)

# Updated role mapping
role_mapping = {
    'vårdnadshavare': 1,
    'ledare': 2,
    'kutar': 3,
    'tumlare': 4,
    'upptäckare': 5,
    'äventyrare': 6,
    'utmanare': 7,
    'rover': 8,
    'vuxenscout': 10
}

# Function to fetch calendar events
def fetch_calendar_events():
    events_list = []
    url = 'http://cal.svenskalag.se/19717'
    response = requests.get(url)
    
    if response.status_code == 200:
        ical_data = response.content.decode('utf-8')
        cal = Calendar.from_ical(ical_data)

        now = datetime.now(timezone.utc)  
        one_month_ago = now - timedelta(days=30)

        for component in cal.walk():
            if component.name == "VEVENT":
                summary = str(component.get('summary'))
                scout_level = None
                if "//" in summary:
                    scout_level = summary.split("//")[-1].split('-')[0].strip()
                
                start_date = component.get('dtstart').dt
                if start_date < one_month_ago:
                    continue

                existing_activity = Activity.query.filter_by(
                    name=summary,
                    start_date=start_date
                ).first()

                if not existing_activity:
                    # Map the scout level from the summary to the correct role_id
                    role_id = role_mapping.get(scout_level.lower()) if scout_level else None
                    
                    # Save new activity if role_id is found
                    if role_id:
                        new_activity = Activity(
                            name=summary,
                            start_date=start_date,
                            end_date=component.get('dtend').dt if component.get('dtend') else None,
                            role_id=role_id,
                            address=str(component.get('location')),
                            description=str(component.get('description')).split("Aktiviteten hämtad")[0].strip(),
                            is_visible=True  # Default to visible
                        )
                        db.session.add(new_activity)
                        db.session.commit()
                        
                        events_list.append({
                            'activity_id': new_activity.activity_id,
                            'summary': new_activity.name,
                            'dtstart': str(new_activity.start_date),
                            'dtend': str(new_activity.end_date),
                            'location': new_activity.address,
                            'description': new_activity.description,
                            'scout_level': scout_level
                        })
    
    return events_list


@activity_bp.route('/api/protected/activity/by_role', methods=['GET'])
@token_required
def get_activities_by_role(current_user):
    now = datetime.now()

    # --- Barnaktiviteter ---
    # Hämta barn som är kopplade till den inloggade användaren
    children = db.session.query(Child).join(ParentChildLink).filter(
        ParentChildLink.user_id == current_user.user_id
    ).all()

    # Hämta rollnamn baserat på barnens `role_id`
    children_roles = [Role.query.filter_by(role_id=child.role_id).first().name.lower() for child in children]

    # Matcha `role_ids` för aktiviteter som stämmer överens med barnens roller
    role_ids = [role_mapping[role] for role in children_roles if role in role_mapping]

    # Hämta aktiviteter för barnens roller
    children_activities = Activity.query.filter(
        Activity.role_id.in_(role_ids),
        Activity.start_date >= now,
        Activity.is_visible == True
    ).all()

    # --- Ledaraktiviteter ---
    # Kontrollera om användaren har rollen "ledare"
    leader_role_id = role_mapping.get('ledare')  # Hämta role_id för "ledare" från mappningen
    leader_activities = []
    if db.session.query(UserRole).filter_by(user_id=current_user.user_id, role_id=leader_role_id).first():
        leader_activities = Activity.query.filter(
            Activity.role_id == leader_role_id,
            Activity.start_date >= now,
            Activity.is_visible == True
        ).all()

    # --- Aktiviteter där användaren är förare ---
    driver_activities = Activity.query.join(Carpool).filter(
        Carpool.driver_id == current_user.user_id,
        Activity.start_date >= now,
        Activity.is_visible == True
    ).all()

    # --- Aktiviteter där användaren är passagerare ---
    passenger_activities = Activity.query.join(Carpool).join(Passenger).filter(
        db.or_(
            Passenger.user_id == current_user.user_id,
            Passenger.child_id.in_([child.child_id for child in children])
        ),
        Activity.start_date >= now,
        Activity.is_visible == True
    ).all()

    # --- Kombinera alla aktiviteter ---
    all_activities = list({activity.activity_id: activity for activity in (
        children_activities + leader_activities + driver_activities + passenger_activities
    )}.values())

    # --- Skapa en lista av aktiviteter ---
    events_list = [{
        'activity_id': activity.activity_id,
        'summary': activity.name,
        'dtstart': str(activity.start_date),
        'dtend': str(activity.end_date),
        'location': activity.address,
        'description': activity.description,
        'scout_level': list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]
    } for activity in all_activities]

    # --- Hämta nya händelser från den externa kalendern om det behövs ---
    new_events = fetch_calendar_events()
    events_list.extend(new_events)

    return make_response(jsonify({"events": events_list}), 200)




# Funktion för att hämta alla synliga aktiviteter
@activity_bp.route('/api/protected/activity/no_role', methods=['GET'])
@token_required
def get_visible_activities(current_user):
    now = datetime.now()

    # Hämta alla aktiviteter som är synliga och inte passerade
    activities = Activity.query.filter(
        Activity.start_date >= now,
        Activity.is_visible == True  # Endast synliga aktiviteter
    ).all()

    # Skapa en lista av aktiviteter
    events_list = [{
        'activity_id': activity.activity_id,
        'summary': activity.name,
        'dtstart': str(activity.start_date),
        'dtend': str(activity.end_date),
        'location': activity.address,
        'description': activity.description,
        'scout_level': list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]
    } for activity in activities]

    # Hämta nya händelser från den externa kalendern om det behövs
    new_events = fetch_calendar_events()
    events_list.extend(new_events)

    return make_response(jsonify({"events": events_list}), 200)



@activity_bp.route('/api/protected/activity/all', methods=['GET'])
@token_required
def get_all_activities(current_user):
    now = datetime.now()
    activities = Activity.query.filter(Activity.start_date >= now).all()
    
    events_list = [{
        'activity_id': activity.activity_id,
        'summary': activity.name,
        'dtstart': str(activity.start_date),
        'dtend': str(activity.end_date),
        'location': activity.address,
        'description': activity.description,
        "is_visible": activity.is_visible,
        'scout_level': list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]
    } for activity in activities]

    return make_response(jsonify({"events": events_list}), 200)

@activity_bp.route('/api/protected/activity/remove/<int:activity_id>', methods=['PUT'])
@token_required
def remove_activity(current_user, activity_id):
    try:
        # Hämta aktiviteten från databasen baserat på ID
        activity = Activity.query.get(activity_id)

        if not activity:
            return make_response(jsonify({"error": "Aktiviteten hittades inte."}), 404)

        # Uppdatera is_visible till False
        activity.is_visible = False
        db.session.commit()

        return make_response(jsonify({
            "message": "Aktiviteten har tagits bort.",
            "activity_id": activity_id
        }), 200)
    except Exception as e:
        current_app.logger.error(f"Error removing activity: {e}")
        return make_response(jsonify({"error": "Ett fel inträffade vid borttagning av aktiviteten."}), 500)
    

@activity_bp.route('/api/protected/activity/make_visible/<int:activity_id>', methods=['PUT'])
@token_required
def make_activity_visible(current_user, activity_id):
    try:
        # Hämta aktiviteten från databasen
        activity = Activity.query.get(activity_id)

        # Kontrollera om aktiviteten finns
        if not activity:
            return make_response(jsonify({"error": "Aktiviteten hittades inte."}), 404)

        # Uppdatera is_visible till True
        activity.is_visible = True
        db.session.commit()

        return make_response(jsonify({"message": "Aktiviteten är nu synlig igen.", "activity_id": activity.activity_id}), 200)

    except Exception as e:
        current_app.logger.error(f"Fel vid aktivering av aktivitet: {e}")
        return make_response(jsonify({"error": "Ett fel uppstod vid aktivering av aktivitet."}), 500)


def parse_date(date_string):
    """Försök att tolka datumet med och utan sekunder."""
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"):
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    raise ValueError(f"Fel format på datum: {date_string}")

@activity_bp.route('/api/protected/activity/create', methods=['POST'])
@token_required
def create_activity(current_user):
    try:
        # Hämta data från förfrågan
        data = request.get_json()

        # Validera obligatoriska fält
        required_fields = ['name', 'start_date', 'address', 'role_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return make_response(jsonify({"error": f"Saknade fält: {', '.join(missing_fields)}"}), 400)

        # Konvertera start_date och end_date till datetime
        start_date = parse_date(data['start_date'])
        end_date = None
        if 'end_date' in data and data['end_date']:
            end_date = parse_date(data['end_date'])

        # Kontrollera om role_id är giltig
        role_id = data['role_id']
        role = Role.query.get(role_id)
        if not role:
            return make_response(jsonify({"error": "Ogiltig roll"}), 400)

        # Skapa ny aktivitet
        new_activity = Activity(
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            role_id=role_id,
            address=data['address'],
            description=data.get('description', ''),  # Beskrivning är valfri
            is_visible=data.get('is_visible', True)  # Standardvärde för synlighet
        )

        # Lägg till aktiviteten i databasen
        db.session.add(new_activity)
        db.session.commit()

        return make_response(jsonify({
            "message": "Aktivitet skapades framgångsrikt.",
            "activity": {
                "activity_id": new_activity.activity_id,
                "name": new_activity.name,
                "start_date": new_activity.start_date,
                "end_date": new_activity.end_date,
                "role_id": new_activity.role_id,
                "address": new_activity.address,
                "description": new_activity.description,
                "is_visible": new_activity.is_visible
            }
        }), 201)

    except ValueError as ve:
        return make_response(jsonify({"error": str(ve)}), 400)
    except Exception as e:
        # Rollback vid fel
        db.session.rollback()
        current_app.logger.error(f"Fel vid skapande av aktivitet: {e}")
        return make_response(jsonify({"error": "Ett fel inträffade vid skapande av aktiviteten."}), 500)


@activity_bp.route('/api/protected/activity/by_carpool/<int:carpool_id>', methods=['GET'])
@token_required
def get_activity_by_carpool(current_user, carpool_id):
    try:
        # Hämta carpool baserat på ID
        carpool = Carpool.query.get(carpool_id)
        if not carpool:
            return make_response(jsonify({"error": "Carpoolen hittades inte."}), 404)

        # Hämta aktivitet kopplad till carpool
        activity = Activity.query.get(carpool.activity_id)
        if not activity:
            return make_response(jsonify({"error": "Aktiviteten kopplad till carpoolen hittades inte."}), 404)
        
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

        # Bygg respons med aktivitet och carpool-detaljer
        response = {
            "activity": {
                "activity_id": activity.activity_id,
                "summary": activity.name,
                "dtstart": activity.start_date.isoformat(),
                "dtend": activity.end_date.isoformat() if activity.end_date else None,
                "location": activity.address,
                "description": activity.description,
                "scout_level": list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]
                if activity.role_id in role_mapping.values() else None
            },
            "carpool": {
                "id": carpool.id,
                "driver_id": carpool.driver_id,
                "carpool_type": carpool.carpool_type,
                "available_seats": carpool.available_seats,
                "departure_address": carpool.departure_address,
                "departure_postcode": carpool.departure_postcode,
                "departure_city": carpool.departure_city,
                "car_model_name": carpool.car.model_name if carpool.car else "Ingen bil tilldelad",
                "created_at": carpool.created_at.isoformat(),
                "passengers": passengers
            }
        }

        return make_response(jsonify(response), 200)

    except Exception as e:
        current_app.logger.error(f"Fel vid hämtning av aktivitet baserat på carpool: {e}")
        return make_response(jsonify({"error": "Ett fel uppstod vid hämtning av aktivitet."}), 500)
