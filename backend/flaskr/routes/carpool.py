from flask import Blueprint, request, jsonify
from extensions import db
from models.carpool_model import Carpool, Passenger, Car
from models.auth_model import Child, ParentChildLink, Role, User
from models.activity_model import Activity
from datetime import datetime
from routes.auth import token_required

carpool_bp = Blueprint('carpool_bp', __name__)

# Endpoint to create a carpool
@carpool_bp.route('/api/carpool/create', methods=['POST'])
@token_required
def create_carpool(current_user):
    data = request.get_json()
    driver_id = current_user.user_id
    car_id = data.get('car_id')
    activity_id = data.get('activity_id')
    available_seats = data.get('available_seats')
    departure_address = data.get('departure_address')
    departure_postcode = data.get('departure_postcode')
    departure_city = data.get('departure_city')
    carpool_type = data.get('carpool_type')

    if not all([car_id, activity_id, available_seats, departure_address, departure_postcode, departure_city, carpool_type]):
        return jsonify({"error": "All fields are required!"}), 400

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
            "passengers": [
                {
                    "child_id": passenger.child_id,
                    "name": f"{child.first_name} {child.last_name}",
                    "phone": child.phone,
                    "parents": [
                        {"name": f"{parent.first_name} {parent.last_name}", "phone": parent.phone}
                        for parent in User.query.join(ParentChildLink).filter(ParentChildLink.child_id == child.child_id).all()
                    ]
                }
                for passenger in carpool.passengers
                for child in [Child.query.get(passenger.child_id)]
                if child
            ]
        }
        for carpool in carpools
    ]

    return jsonify({"carpools": carpool_list}), 200

# Endpoint to add a passenger to a carpool
@carpool_bp.route('/api/carpool/add-passenger', methods=['POST'])
@token_required
def add_passenger(current_user):
    data = request.get_json()
    carpool_id = request.args.get('carpool_id', type=int)
    child_id = data.get('child_id')

    # Kontrollera att carpool_id är angiven
    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    # Hämta carpool baserat på carpool_id
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    # Kontrollera om det finns lediga platser
    if carpool.available_seats <= 0:
        return jsonify({"error": "No available seats in this carpool!"}), 402

    # Kontrollera om barnet redan är tillagd i carpoolen
    existing_passenger = Passenger.query.filter_by(carpool_id=carpool_id, child_id=child_id).first()
    if existing_passenger:
        return jsonify({"error": "Child already added to this carpool!"}), 401

    # Lägg till barnet som en ny passagerare i carpoolen
    new_passenger = Passenger(child_id=child_id, carpool_id=carpool_id)
    carpool.available_seats -= 1

    db.session.add(new_passenger)
    db.session.commit()

    return jsonify({"message": "Passenger added successfully!"}), 201


# Endpoint to check if a parent has multiple children with the same role
@carpool_bp.route('/api/carpool/check-multiple-children', methods=['GET'])
@token_required
def check_multiple_children(current_user):
    carpool_id = request.args.get('carpool_id', type=int)
    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    activity = Activity.query.get(carpool.activity_id)
    if not activity or not activity.role_id:
        return jsonify({"error": "Associated activity or role not found!"}), 404

    role_id = activity.role_id
    children = db.session.query(Child).join(ParentChildLink).filter(
        ParentChildLink.user_id == current_user.user_id,
        Child.role_id == role_id
    ).all()

    if len(children) > 1:
        children_info = [{"child_id": child.child_id, "name": f"{child.first_name} {child.last_name}"} for child in children]
        return jsonify({"multiple": True, "children": children_info}), 200
    elif children:
        return jsonify({"multiple": False, "child_id": children[0].child_id}), 200
    else:
        return jsonify({"multiple": False, "child_id": None, "message": "No children found for this role."}), 404

# Endpoint to check if all children have joined
@carpool_bp.route('/api/carpool/all-children-joined', methods=['GET'])
@token_required
def all_children_joined(current_user):
    carpool_id = request.args.get('carpool_id', type=int)
    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    activity = Activity.query.get(carpool.activity_id)
    if not activity or not activity.role_id:
        return jsonify({"error": "Associated activity or role not found!"}), 404

    role_id = activity.role_id
    children_with_role = db.session.query(Child).join(ParentChildLink).filter(
        ParentChildLink.user_id == current_user.user_id,
        Child.role_id == role_id
    ).all()

    passenger_child_ids = [p.child_id for p in Passenger.query.filter_by(carpool_id=carpool_id).all()]
    all_joined = all(child.child_id in passenger_child_ids for child in children_with_role)

    return jsonify({"all_joined": all_joined}), 200

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

# Endpoint to get a carpool's passengers
@carpool_bp.route('/api/carpool/<int:carpool_id>/passengers', methods=['GET'])
@token_required
def list_passengers(current_user, carpool_id):
    passengers = Passenger.query.filter_by(carpool_id=carpool_id).all()
    passenger_data = [{"id": passenger.id, "child_id": passenger.child_id} for passenger in passengers]

    return jsonify({"passengers": passenger_data}), 200

# Endpoint to add a car for the current user
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
    user_cars = Car.query.filter_by(owner_id=current_user.user_id).all()

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
    car = Car.query.filter_by(car_id=car_id, owner_id=current_user.user_id).first()
    if not car:
        return jsonify({"error": "Car not found or not authorized to delete this car"}), 404

    db.session.delete(car)
    db.session.commit()

    return jsonify({"message": "Car deleted successfully!"}), 200

# Endpoint to remove a passenger from a carpool
@carpool_bp.route('/api/carpool/remove-passenger', methods=['DELETE'])
@token_required
def remove_passenger(current_user):
    data = request.get_json()
    carpool_id = data.get('carpool_id')
    child_id = data.get('child_id')

    if not carpool_id or not child_id:
        return jsonify({"error": "Both carpool_id and child_id are required to remove a passenger"}), 400

    passenger = Passenger.query.filter_by(carpool_id=carpool_id, child_id=child_id).first()
    if not passenger:
        return jsonify({"error": "Passenger not found in the specified carpool"}), 404

    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    db.session.delete(passenger)
    carpool.available_seats += 1
    db.session.commit()

    return jsonify({"message": "Passenger removed from carpool"}), 200

# Endpoint to get driver information for a carpool
@carpool_bp.route('/api/carpool/<int:carpool_id>/driver', methods=['GET'])
@token_required
def get_driver_info(current_user, carpool_id):
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found"}), 404

    driver = User.query.get(carpool.driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    driver_info = {
        "driver_id": driver.user_id,
        "first_name": driver.first_name,
        "last_name": driver.last_name,
        "phone": driver.phone,
    }

    return jsonify({"driver": driver_info}), 200
