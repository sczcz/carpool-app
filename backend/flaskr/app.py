from flask import Flask, render_template, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.user_handler import user_handler
import os
from extensions import db
from models.auth_model import User, Role
from routes.activity import activity_bp
from routes.carpool import carpool_bp
from test_data import add_test_data  # Import the add_test_data function

app = Flask(__name__)

CORS(app, supports_credentials=True, resources={r"/api/*": {
    "origins": ["http://localhost:3000"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

# Database setup
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'users.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'default_secret_key')

db.init_app(app)

# Ensure the instance folder exists
if not os.path.exists(os.path.join(basedir, 'instance')):
    os.makedirs(os.path.join(basedir, 'instance'))

# Seeding roles function
def seed_roles():
    # Seed roles if they don't already exist
    if not Role.query.filter_by(name='vårdnadshavare').first():
        guardian_role = Role(name='vårdnadshavare')
        db.session.add(guardian_role)

    if not Role.query.filter_by(name='ledare').first():
        leader_role = Role(name='ledare')
        db.session.add(leader_role)

    if not Role.query.filter_by(name='tumlare').first():
        tumlare_role = Role(name='tumlare')
        db.session.add(tumlare_role)

    if not Role.query.filter_by(name='kutar').first():
        kutar_role = Role(name='kutar')
        db.session.add(kutar_role)

    if not Role.query.filter_by(name='upptäckare').first():
        explorer_role = Role(name='upptäckare')
        db.session.add(explorer_role)

    if not Role.query.filter_by(name='äventyrare').first():
        adventurer_role = Role(name='äventyrare')
        db.session.add(adventurer_role)

    if not Role.query.filter_by(name='utmanare').first():
        challenger_role = Role(name='utmanare')
        db.session.add(challenger_role)

    if not Role.query.filter_by(name='rover').first():
        rover_role = Role(name='rover')
        db.session.add(rover_role)

    db.session.commit()

# Create all tables and seed roles in the app context
with app.app_context():
    db.create_all()

    # Seed roles once (if not already seeded)
    seed_roles()

    # Check if any users exist, if not, call add_test_data
    if not User.query.first():
        add_test_data()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_handler)
app.register_blueprint(activity_bp)
app.register_blueprint(carpool_bp)

# Route for rendering index.html
@app.route('/')
def index():
    return render_template('index.html')

# Route to get all users
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{"id": user.user_id, "email": user.email} for user in users]
    return jsonify(users_list), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')