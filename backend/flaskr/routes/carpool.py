from flask import Blueprint, request, jsonify
from extensions import db
from models.carpool_model import Carpool, Passenger, Car  # Import your models
from models.auth_model import Child
from models.activity_model import Activity
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

    if not activity_id:
        return jsonify({"error": "Activity ID is required!"}), 400

    # Hämta carpools baserat på activity_id
    carpools = Carpool.query.filter_by(activity_id=activity_id).all()

    carpool_list = [
        {
            "id": carpool.id,
            "driver_id": carpool.driver_id,
            "car_id": carpool.car_id,
            "available_seats": carpool.available_seats,
            "departure_address": carpool.departure_address,
            "departure_postcode": carpool.departure_postcode,
            "departure_city": carpool.departure_city,
            "carpool_type": carpool.carpool_type,
            "passengers": [p.child_id for p in carpool.passengers]
        }
        for carpool in carpools
    ]

    return jsonify({"carpools": carpool_list}), 200


# Endpoint to add a passenger to a carpool
@carpool_bp.route('/api/carpool/add-passenger', methods=['POST'])
@token_required
def add_passenger(current_user):
    data = request.get_json()
    carpool_id = request.args.get('carpool_id')
    child_id = data.get('child_id')

    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    # Check if child is already in the carpool
    existing_passenger = Passenger.query.filter_by(carpool_id=carpool_id, child_id=child_id).first()
    if existing_passenger:
        return jsonify({"error": "Child already added to this carpool!"}), 401

    # Step 1: Find the carpool and associated activity
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    if carpool.available_seats <= 0:
        return jsonify({"error": "No available seats in this carpool!"}), 402

    # Step 2: If child_id is provided, use it; otherwise, find the child by parent's role
    if not child_id:
        # Retrieve role ID from the associated activity
        activity = Activity.query.get(carpool.activity_id)
        if not activity or not activity.role_id:
            return jsonify({"error": "Associated activity or role not found!"}), 404

        # Find the child based on the role for the current user as either parent
        desired_role = activity.role_id
        child = Child.query.filter(
            ((Child.parent_1_id == current_user.user_id) | (Child.parent_2_id == current_user.user_id)),
            Child.role_id == desired_role
        ).first()

        if not child:
            return jsonify({"error": "Child not found for this parent and role!"}), 404
        child_id = child.child_id

    # Step 3: Add the child to the carpool
    new_passenger = Passenger(child_id=child_id, carpool_id=carpool_id)
    carpool.available_seats -= 1

    db.session.add(new_passenger)
    db.session.commit()

    return jsonify({"message": "Passenger added successfully!"}), 201


# Endpoint to check if a parent has multiple children with the same role
@carpool_bp.route('/api/carpool/check-multiple-children', methods=['GET'])
@token_required
def check_multiple_children(current_user):
    # Retrieve carpool_id from the query parameters
    carpool_id = request.args.get('carpool_id', type=int)
    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    # Step 1: Find the carpool to retrieve the associated activity ID
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    # Step 2: Use the activity ID to get the role associated with that activity
    activity = Activity.query.get(carpool.activity_id)
    if not activity or not activity.role_id:
        return jsonify({"error": "Associated activity or role not found!"}), 404

    role_id = activity.role_id

    # Step 3: Query children under the current user with the specified role
    children = Child.query.filter(
        ((Child.parent_1_id == current_user.user_id) | (Child.parent_2_id == current_user.user_id)),
        Child.role_id == role_id
    ).all()

    # Step 4: Check if there are multiple children with the given role
    if len(children) > 1:
        # Prepare a list with child info if multiple children are found
        children_info = [{"child_id": child.child_id, "name": f"{child.first_name} {child.last_name}"} for child in children]
        return jsonify({"multiple": True, "children": children_info}), 200
    elif children:
        # Single child case
        return jsonify({"multiple": False, "child_id": children[0].child_id}), 200
    else:
        # No children found case
        return jsonify({"multiple": False, "child_id": None, "message": "No children found for this role."}), 404





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

@carpool_bp.route('/api/protected/add-car', methods=['POST'])
@token_required
def add_car(current_user):
    data = request.get_json()

    reg_number = data.get('reg_number')
    fuel_type = data.get('fuel_type')
    consumption = data.get('consumption')
    model_name = data.get('model_name')

    if not all([reg_number, fuel_type, consumption, model_name]):
        return jsonify({"error": "All fields are required!"}), 400

    # Create a new car
    new_car = Car(
        owner_id=current_user.user_id,
        reg_number=reg_number,
        fuel_type=fuel_type,
        consumption=consumption,
        model_name=model_name
    )

    db.session.add(new_car)
    db.session.commit()

    return jsonify({"message": "Car added successfully!"}), 201

# Endpoint to retrieve the cars of the logged-in user
@carpool_bp.route('/api/protected/get-cars', methods=['GET'])
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

# Endpoint to delete a car by car_id
@carpool_bp.route('/api/protected/delete-car/<int:car_id>', methods=['DELETE'])
@token_required
def delete_car(current_user, car_id):
    # Query the car to delete
    car = Car.query.filter_by(car_id=car_id, owner_id=current_user.user_id).first()

    if not car:
        return jsonify({"error": "Car not found or not authorized to delete this car"}), 404

    # Delete the car
    db.session.delete(car)
    db.session.commit()

    return jsonify({"message": "Car deleted successfully!"}), 200
