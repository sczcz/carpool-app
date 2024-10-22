from flask import Blueprint, request, jsonify
from extensions import db
from models.carpool_model import Carpool, Passenger, Car  # Import your models
from datetime import datetime
from routes.auth import token_required  # Assuming you're using the token for authorization

carpool_bp = Blueprint('carpool_bp', __name__)

# Endpoint to create a carpool
@carpool_bp.route('/api/carpool/create', methods=['POST'])
@token_required
def create_carpool(current_user):
    data = request.get_json()

    # Validate required fields
    driver_id = current_user.user_id
    car_id = data.get('car_id')
    activity_id = data.get('activity_id')
    available_seats = data.get('available_seats')
    departure_address = data.get('departure_address')
    departure_postcode = data.get('departure_postcode')
    departure_city = data.get('departure_city')
    carpool_type = data.get('carpool_type')

    if not all([driver_id, car_id, activity_id, available_seats, departure_address, departure_postcode, departure_city, carpool_type]):
        return jsonify({"error": "All fields are required!"}), 400

    # Create new carpool
    new_carpool = Carpool(
        driver_id=driver_id,
        car_id=car_id,
        activity_id=activity_id,
        available_seats=available_seats,
        departure_address=departure_address,
        departure_postcode=departure_postcode,
        departure_city=departure_city,
        carpool_type=carpool_type,
        created_at=datetime.utcnow()
    )

    db.session.add(new_carpool)
    db.session.commit()

    return jsonify({"message": "Carpool created successfully!"}), 201


# Endpoint to get carpools
@carpool_bp.route('/api/carpool/list', methods=['GET'])
@token_required
def list_carpools(current_user):
    activity_id = request.args.get('activity_id')

    if activity_id:
        carpools = Carpool.query.filter_by(activity_id=activity_id).all()
    else:
        carpools = Carpool.query.all()

    # Serialize carpools
    carpool_data = [
        {
            "id": carpool.id,
            "driver_id": carpool.driver_id,
            "car_id": carpool.car_id,
            "activity_id": carpool.activity_id,
            "available_seats": carpool.available_seats,
            "departure_address": carpool.departure_address,
            "departure_postcode": carpool.departure_postcode,
            "departure_city": carpool.departure_city,
            "carpool_type": carpool.carpool_type,
            "created_at": carpool.created_at
        }
        for carpool in carpools
    ]

    return jsonify({"carpools": carpool_data}), 200

# Endpoint to add a passenger to a carpool
@carpool_bp.route('/api/carpool/<int:carpool_id>/add-passenger', methods=['POST'])
@token_required
def add_passenger(current_user, carpool_id):
    data = request.get_json()

    child_id = data.get('child_id')

    if not child_id:
        return jsonify({"error": "Child ID is required!"}), 400

    # Check if carpool exists
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    # Check if there's space in the carpool
    if carpool.available_seats <= 0:
        return jsonify({"error": "No available seats in this carpool!"}), 400

    # Add passenger to the carpool
    new_passenger = Passenger(child_id=child_id, carpool_id=carpool_id)

    # Update available seats
    carpool.available_seats -= 1

    db.session.add(new_passenger)
    db.session.commit()

    return jsonify({"message": "Passenger added successfully!"}), 201


# Endpoint to delete a carpool
@carpool_bp.route('/api/carpool/<int:carpool_id>/delete', methods=['DELETE'])
@token_required
def delete_carpool(current_user, carpool_id):
    carpool = Carpool.query.get(carpool_id)

    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    db.session.delete(carpool)
    db.session.commit()

    return jsonify({"message": "Carpool deleted successfully!"}), 200


# Endpoint to list passengers in a carpool
@carpool_bp.route('/api/carpool/<int:carpool_id>/passengers', methods=['GET'])
@token_required
def list_passengers(current_user, carpool_id):
    passengers = Passenger.query.filter_by(carpool_id=carpool_id).all()

    if not passengers:
        return jsonify({"error": "No passengers found!"}), 404

    passenger_data = [
        {
            "id": passenger.id,
            "child_id": passenger.child_id,
        }
        for passenger in passengers
    ]

    return jsonify({"passengers": passenger_data}), 200


# Endpoint to retrieve the cars of the logged-in user
@carpool_bp.route('/api/user/cars', methods=['GET'])
@token_required
def get_user_cars(current_user):
    # Query to get all cars for the logged-in user
    user_cars = Car.query.filter_by(owner_id=current_user.user_id).all()

    # If no cars found, return an empty list
    if not user_cars:
        return jsonify({"message": "No cars found for this user", "cars": []}), 200

    # Serialize car information to send as JSON
    cars_data = [
        {
            "car_id": car.car_id,
            "reg_number": car.reg_number,
            "fuel_type": car.fuel_type,
            "consumption": car.consumption,
            "model_name": car.model_name,
        }
        for car in user_cars
    ]

    return jsonify({"message": "User cars retrieved successfully", "cars": cars_data}), 200