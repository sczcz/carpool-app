from flask import Flask, render_template, jsonify
from flask_cors import CORS
from routes.auth import auth_bp  # Import auth blueprint
from routes.user_handler import user_handler
import os
from extensions import db  # Import db instance
from models.auth_model import User, Role  # Import your User model

app = Flask(__name__)

# Tillåt CORS med credentials för att inkludera cookies i begäran från React-klienten
CORS(app, supports_credentials=True, resources={r"/api/*": {
    "origins": ["http://localhost:3000"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

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
app.register_blueprint(user_handler)

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

@app.before_request
def seed_roles():
    # Kontrollera om rollerna redan finns för att undvika dubbletter
    if not Role.query.filter_by(name='vårdnadshavare').first():
        guardian_role = Role(name='vårdnadshavare')
        db.session.add(guardian_role)
    
    if not Role.query.filter_by(name='ledare').first():
        leader_role = Role(name='ledare')
        db.session.add(leader_role)
    
    if not Role.query.filter_by(name='spårare').first():
        sparare_role = Role(name='spårare')
        db.session.add(sparare_role)

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
    
    # Spara ändringarna
    db.session.commit()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
