from flask import Flask, render_template, request, jsonify
from database import db, User
from flask_cors import CORS
from auth import auth_bp  # Import the auth blueprint
import os

app = Flask(__name__)

CORS(app)  # Enable CORS for the entire app

# Create a specific path for the database
basedir = os.path.abspath(os.path.dirname(__file__))  # Gets the base directory of your project
db_path = os.path.join(basedir, 'instance', 'users.db')  # Change 'backend' to your desired folder

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'  # Use the correct path for your DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET'] = 'your_jwt_secret_key'

# Initialize the database with the Flask app
db.init_app(app)

# Ensure the directory exists
if not os.path.exists(os.path.join(basedir, 'instance')):
    os.makedirs(os.path.join(basedir, 'instance'))

# Create all tables
with app.app_context():
    db.create_all()

# Register the auth blueprint
app.register_blueprint(auth_bp)

# Route to render index.html
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{"id": user.user_id, "email": user.email} for user in users]
    return jsonify(users_list), 200

if __name__ == '__main__':
    app.run(debug=True)
