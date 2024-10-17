from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
import requests
import json
from icalendar import Calendar, Event
from routes.auth import token_required
import sys
from models.auth_model import Child, Role
sys.stdout.reconfigure(encoding='utf-8')

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/api/protected/activity/all', methods=['GET'])
@token_required
def get_all_activities(current_user):

    # Hämta barnens roller för den inloggade användaren
    children = Child.query.filter((Child.parent_1_id == current_user.user_id) | (Child.parent_2_id == current_user.user_id)).all()
    children_roles = [Role.query.filter_by(role_id=child.role_id).first().name for child in children]

    print(children_roles)

    url = 'http://cal.svenskalag.se/19717'
    response = requests.get(url)

    if response.status_code == 200:
        ical_data = response.content.decode('utf-8')
        cal = Calendar.from_ical(ical_data)

        events_list = []

        for component in cal.walk():
            if component.name == "VEVENT":
                description = str(component.get('description'))
                summary = str(component.get('summary'))

                # Ta bort texten "Aktiviteten hämtad och synkas från Svenskalag.se." och allt efter den
                if "Aktiviteten hämtad och synkas från Svenskalag.se." in description:
                    description = description.split("Aktiviteten hämtad och synkas från Svenskalag.se.")[0].strip()

                

                # Hämta scout-level från summary
                scout_level = None
                if "//" in summary:
                    scout_level = summary.split("//")[-1].split('-')[0].strip()  # Hämta scout-level efter //

                if "- Jonstorps Kustscoutkår" in summary:
                    summary = summary.split("//")[0].strip()

                # Om scout_level matchar någon av barnens roller, inkludera evenemanget
                if scout_level.lower() in children_roles:
                    event_data = {
                        'summary': summary,
                        'dtstart': str(component.get('dtstart').dt),
                        'dtend': str(component.get('dtend').dt),
                        'location': str(component.get('location')),
                        'description': description,  # Modifierad beskrivning utan "hämtad och synkad från"
                        'scout_level': scout_level  # Scout-level extraherad från summary
                    }
                    events_list.append(event_data)

        # Returnera endast de aktiviteter som matchar barnens roller
        response_data = {
            "events": events_list
        }

        # Return the structured calendar data as JSON
        return make_response(jsonify(response_data), 200)

    else:
        return make_response(jsonify({"message": "Failed to retrieve calendar data"}), 400)
