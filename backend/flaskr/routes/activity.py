from flask import Blueprint, request, jsonify, make_response, current_app
from extensions import db
import requests
import json
from icalendar import Calendar, Event
from routes.auth import token_required
import sys
sys.stdout.reconfigure(encoding='utf-8')

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/api/protected/activity/all', methods=['GET'])
@token_required
def get_all_activities(current_user):

    url = 'http://cal.svenskalag.se/19717'

    response = requests.get(url)

    if response.status_code == 200:
        ical_data = response.content.decode('utf-8')

        cal = Calendar.from_ical(ical_data)

        events_list = []
        scout_levels_set = set()

        for component in cal.walk():
            if component.name == "VEVENT":
                description = str(component.get('description'))
                event_data = {
                    'summary': str(component.get('summary')),
                    'dtstart': str(component.get('dtstart').dt),
                    'dtend': str(component.get('dtend').dt),
                    'location': str(component.get('location')),
                    'description': description
                }
                events_list.append(event_data)

                if description:
                    if 'www.svenskalag.se/jonstorpskustscout-' in description:
                        start_index = description.find('www.svenskalag.se/jonstorpskustscout-') + len('www.svenskalag.se/jonstorpskustscout-')
                        scout_level = description[start_index:].strip().split()[0]
                        if scout_level:
                            scout_levels_set.add(scout_level)

        scout_levels_list = list(scout_levels_set)

        # Structure data to include events and unique scout levels
        response_data = {
            "events": events_list,
            "unique_scout_levels": scout_levels_list
        }

        # Return the structured calendar data as JSON
        return make_response(jsonify(response_data), 200)

    else:
        return make_response(jsonify({"message": "Failed to retrieve calendar data"}), 400)