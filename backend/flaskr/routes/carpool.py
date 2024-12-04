from flask import Blueprint, request, jsonify
from extensions import db
from models.carpool_model import Carpool, Passenger, Car
from models.auth_model import Child, ParentChildLink
from models.activity_model import Activity
from models.message_model import CarpoolMessage
from datetime import datetime
from routes.auth import token_required, User

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

    carpool_list = []
    for carpool in carpools:
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

        # Hämta bilinformation om den finns
        car = Car.query.get(carpool.car_id)

        # Bygg carpool-objektet
        carpool_list.append({
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
        })

    return jsonify({"carpools": carpool_list}), 200

@carpool_bp.route('/api/carpool/add-passenger', methods=['POST'])
@token_required
def add_passenger(current_user):
    data = request.get_json()
    carpool_id = data.get('carpool_id')
    child_id = data.get('child_id')
    user_id = data.get('user_id', current_user.user_id) if data.get('add_self') else None

    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    # Kontrollera att minst en av `child_id` eller `user_id` är angiven
    if not child_id and not user_id:
        return jsonify({"error": "Either child_id or user_id must be provided!"}), 400

    # Kontrollera om passageraren redan är i carpoolen
    existing_passenger = Passenger.query.filter_by(carpool_id=carpool_id, child_id=child_id, user_id=user_id).first()
    if existing_passenger:
        return jsonify({"error": "Passenger already added to this carpool!"}), 401

    # Hitta carpoolen och kontrollera att det finns platser
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    if carpool.available_seats <= 0:
        return jsonify({"error": "No available seats in this carpool!"}), 402

    # Om `child_id` inte är angivet och `user_id` inte används, hämta barn baserat på roll och användare
    if not child_id and not user_id:
        activity = Activity.query.get(carpool.activity_id)
        if not activity or not activity.role_id:
            return jsonify({"error": "Associated activity or role not found!"}), 404

        desired_role = activity.role_id
        child = Child.query.join(ParentChildLink, ParentChildLink.child_id == Child.child_id)\
                           .filter(ParentChildLink.user_id == current_user.user_id,
                                   Child.role_id == desired_role)\
                           .first()
        if not child:
            return jsonify({"error": "Child not found for this parent and role!"}), 404
        child_id = child.child_id

    # Lägg till passageraren och uppdatera tillgängliga platser
    new_passenger = Passenger(child_id=child_id, user_id=user_id, carpool_id=carpool_id)
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

    # Step 3: Query children under the current user with the specified role using ParentChildLink
    children = Child.query.join(ParentChildLink, ParentChildLink.child_id == Child.child_id)\
                          .filter(ParentChildLink.user_id == current_user.user_id, Child.role_id == role_id)\
                          .all()

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

    

@carpool_bp.route('/api/carpool/all-children-joined', methods=['GET'])
@token_required
def all_children_joined(current_user):
    carpool_id = request.args.get('carpool_id', type=int)
    if not carpool_id:
        return jsonify({"error": "Carpool ID is required!"}), 400

    # Retrieve carpool and associated activity
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    activity = Activity.query.get(carpool.activity_id)
    if not activity or not activity.role_id:
        return jsonify({"error": "Associated activity or role not found!"}), 404

    role_id = activity.role_id

    # Retrieve all children of the current user with the specified role using ParentChildLink
    children_with_role = Child.query.join(ParentChildLink, ParentChildLink.child_id == Child.child_id)\
                                    .filter(ParentChildLink.user_id == current_user.user_id, Child.role_id == role_id)\
                                    .all()

    # Retrieve all passengers in the carpool
    passengers = Passenger.query.filter_by(carpool_id=carpool_id).all()
    passenger_child_ids = [p.child_id for p in passengers]
    passenger_user_ids = [p.user_id for p in passengers]

    # Check if every child with this role is in the carpool
    all_children_joined = all(child.child_id in passenger_child_ids for child in children_with_role)

    # Check if the user is already a passenger
    user_already_joined = current_user.user_id in passenger_user_ids

    return jsonify({
        "all_children_joined": all_children_joined,
        "user_already_joined": user_already_joined
    }), 200


@carpool_bp.route('/api/carpool/<int:carpool_id>/delete', methods=['DELETE'])
@token_required
def delete_carpool(current_user, carpool_id):
    try:
        # Hämta carpool
        carpool = Carpool.query.get(carpool_id)

        if not carpool:
            return jsonify({"error": "Carpool not found!"}), 404

        # Ta bort alla relaterade passagerare
        Passenger.query.filter_by(carpool_id=carpool_id).delete()

        # Ta bort alla relaterade meddelanden
        CarpoolMessage.query.filter_by(carpool_id=carpool_id).delete()

        # Ta bort carpool
        db.session.delete(carpool)
        db.session.commit()

        return jsonify({"message": "Carpool deleted successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



@carpool_bp.route('/api/carpool/<int:carpool_id>/passengers', methods=['GET'])
@token_required
def list_passengers(current_user, carpool_id):
    passengers = Passenger.query.filter_by(carpool_id=carpool_id).all()

    passenger_data = []
    for passenger in passengers:
        if passenger.child_id:  # Om passageraren är ett barn
            child = Child.query.get(passenger.child_id)
            if child:
                parent_links = ParentChildLink.query.filter_by(child_id=child.child_id).all()
                parents = [
                    {
                        "parent_id": parent.user_id,
                        "parent_name": f"{User.query.get(parent.user_id).first_name} {User.query.get(parent.user_id).last_name}",
                        "parent_phone": User.query.get(parent.user_id).phone
                    }
                    for parent in parent_links
                ]
                passenger_data.append({
                    "type": "child",
                    "child_id": child.child_id,
                    "child_name": f"{child.first_name} {child.last_name}",
                    "child_phone": child.phone,
                    "parents": parents
                })
        elif passenger.user_id:  # Om passageraren är en användare
            user = User.query.get(passenger.user_id)
            if user:
                passenger_data.append({
                    "type": "user",
                    "user_id": user.user_id,
                    "user_name": f"{user.first_name} {user.last_name}",
                    "user_phone": user.phone,
                    "parents": []  # Lägg till tom lista för att matcha frontend-struktur
                })

    return jsonify({"passengers": passenger_data}), 200



@carpool_bp.route('/api/protected/add-car', methods=['POST'])
@token_required
def add_car(current_user):
    data = request.get_json()

    reg_number = data.get('reg_number')
    fuel_type = data.get('fuel_type')
    model_name = data.get('model_name')

    if not all([reg_number, fuel_type, model_name]):
        return jsonify({"error": "All fields are required!"}), 400

    # Create a new car
    new_car = Car(
        owner_id=current_user.user_id,
        reg_number=reg_number,
        fuel_type=fuel_type,
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


@carpool_bp.route('/api/carpool/remove-passenger', methods=['DELETE'])
@token_required
def remove_passenger(current_user):
    """Tar bort en passagerare (användare eller barn) från en carpool."""
    data = request.get_json()
    carpool_id = data.get('carpool_id')
    child_id = data.get('child_id')  # För barn
    user_id = data.get('user_id')  # För användare

    if not carpool_id or (not child_id and not user_id):
        return jsonify({"error": "carpool_id och antingen child_id eller user_id krävs för att ta bort en passagerare"}), 400

    # Kontrollera om passageraren finns i carpoolen
    passenger = None
    if child_id:
        passenger = Passenger.query.filter_by(carpool_id=carpool_id, child_id=child_id).first()
    elif user_id:
        passenger = Passenger.query.filter_by(carpool_id=carpool_id, user_id=user_id).first()

    if not passenger:
        return jsonify({"error": "Passageraren finns inte i den angivna carpoolen"}), 404

    # Hämta carpoolen och validera att den existerar
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found!"}), 404

    # Ta bort passageraren
    try:
        db.session.delete(passenger)
        carpool.available_seats += 1
        db.session.commit()
        return jsonify({"message": "Passageraren har tagits bort från carpoolen"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ett fel inträffade vid borttagningen av passageraren: {str(e)}"}), 500


@carpool_bp.route('/api/carpool/<int:carpool_id>/driver', methods=['GET'])
@token_required
def get_driver_info(current_user, carpool_id):
    # Hämta carpool baserat på carpool_id
    carpool = Carpool.query.get(carpool_id)
    if not carpool:
        return jsonify({"error": "Carpool not found"}), 404

    # Hämta användaren (driver) baserat på driver_id
    driver = User.query.get(carpool.driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    # Returnera förarens namn och annan relevant information
    driver_info = {
        "driver_id": driver.user_id,
        "first_name": driver.first_name,
        "last_name": driver.last_name,
        "phone": driver.phone,  # Lägg till fler attribut om nödvändigt
    }

    return jsonify({"driver": driver_info}), 200
