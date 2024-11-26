from flask import Flask, render_template, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.user_handler import user_handler
import os
from extensions import db, socketio
from models.auth_model import User
from routes.activity import activity_bp
from routes.carpool import carpool_bp
from routes.message import message_bp
from routes.notifications import notifications_bp
from test_data import add_test_data
from seed_roles import seed_roles
from seed_admin import seed_admin


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio.init_app(app, cors_allowed_origins="*")

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

# Create all tables and seed roles in the app context
with app.app_context():
    db.create_all()

    # Seed roles once (if not already seeded)
    seed_roles()

    # Check if any users exist, if not, call add_test_data
    if not User.query.first():
        seed_admin()
        add_test_data()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_handler)
app.register_blueprint(activity_bp)
app.register_blueprint(carpool_bp)
app.register_blueprint(message_bp)
app.register_blueprint(notifications_bp)

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
    socketio.run(app, debug=True, host='0.0.0.0', allow_unsafe_werkzeug=True)
