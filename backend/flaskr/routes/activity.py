from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
import requests
from icalendar import Calendar, Event
from routes.auth import token_required
import sys
from models.auth_model import Child, Role
from models.activity_model import Activity
import datetime
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
    'rover': 8
}

@activity_bp.route('/api/protected/activity/all', methods=['GET'])
@token_required
def get_all_activities(current_user):

    # Fetch the user's children and their roles
    children = Child.query.filter(
        (Child.parent_1_id == current_user.user_id) | (Child.parent_2_id == current_user.user_id)
    ).all()
    
    # Get children roles from the updated role_mapping
    children_roles = [Role.query.filter_by(role_id=child.role_id).first().name.lower() for child in children]

    # Query the Activity table for upcoming events related to the children’s roles
    now = datetime.datetime.now()
    
    # Using role names from role_mapping to match activities
    role_ids = [role_mapping[role] for role in children_roles if role in role_mapping]

    activities = Activity.query.filter(
        Activity.role_id.in_(role_ids),
        Activity.start_date >= now
    ).all()

    # Collect events already in the database
    events_list = [{
        'activity_id': activity.activity_id,
        'summary': activity.name,
        'dtstart': str(activity.start_date),
        'dtend': str(activity.end_date),
        'location': activity.address,
        'description': activity.description,
        'scout_level': list(role_mapping.keys())[list(role_mapping.values()).index(activity.role_id)]  # Assuming role_id is mapped correctly
    } for activity in activities]

    # Check if any new activities need to be fetched from the external calendar
    url = 'http://cal.svenskalag.se/19717'
    response = requests.get(url)
    if response.status_code == 200:
        ical_data = response.content.decode('utf-8')
        cal = Calendar.from_ical(ical_data)

        for component in cal.walk():
            if component.name == "VEVENT":
                summary = str(component.get('summary'))
                scout_level = None
                if "//" in summary:
                    scout_level = summary.split("//")[-1].split('-')[0].strip()
                
                # If scout_level matches one of the children's roles, process the event
                if scout_level.lower() in role_mapping:
                    start_date = component.get('dtstart').dt
                    existing_activity = Activity.query.filter_by(
                        name=summary,
                        start_date=start_date
                    ).first()

                    if not existing_activity:
                        # Map the scout level from the summary to the correct role_id
                        role_id = role_mapping.get(scout_level.lower())
                        
                        # Save new activity
                        new_activity = Activity(
                            name=summary,
                            start_date=start_date,
                            end_date=component.get('dtend').dt if component.get('dtend') else None,
                            role_id=role_id,  # Use the mapped role_id
                            address=str(component.get('location')),
                            description=str(component.get('description')).split("Aktiviteten hämtad")[0].strip()
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
                        print(new_activity.description)
                        

    return make_response(jsonify({"events": events_list}), 200)
