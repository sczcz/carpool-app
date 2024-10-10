from flask import Flask, render_template, jsonify
from flask_cors import CORS
from routes.auth import auth_bp  # Import auth blueprint
import os
from extensions import db  # Import db instance
from models.auth_model import User  # Import your User model

app = Flask(__name__)

# Tillåt CORS med credentials för att inkludera cookies i begäran från React-klienten
CORS(app, supports_credentials=True, origins=['http://localhost:3000'], methods=['GET', 'POST', 'OPTIONS'])

# Skapa en specifik sökväg för databasen
basedir = os.path.abspath(os.path.dirname(__file__))  # Basen för ditt projekt
db_path = os.path.join(basedir, 'instance', 'users.db')  # Använd rätt sökväg för databasen

# Databas-konfiguration
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'  # Ange rätt databasväg
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'default_secret_key')  # Använd en miljövariabel för JWT-secret

# Initiera databasen med Flask-appen
db.init_app(app)

# Se till att katalogen finns (om den inte redan existerar)
if not os.path.exists(os.path.join(basedir, 'instance')):
    os.makedirs(os.path.join(basedir, 'instance'))

# Skapa alla tabeller
with app.app_context():
    db.create_all()

# Registrera auth blueprint
app.register_blueprint(auth_bp)

# Route för att rendera en grundläggande index.html
@app.route('/')
def index():
    return render_template('index.html')

# Route för att hämta alla användare
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{"id": user.user_id, "email": user.email} for user in users]
    return jsonify(users_list), 200


if __name__ == '__main__':
    app.run(debug=True)
