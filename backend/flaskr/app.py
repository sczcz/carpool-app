from flask import Flask, render_template, request, jsonify
from database import db, User

app = Flask(__name__)

# Konfiguration för SQLite-databasen
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initiera databasen med Flask-applikationen
db.init_app(app)

# Skapa alla tabeller
with app.app_context():
    db.create_all()

# Route för att rendera index.html
@app.route('/')
def index():
    return render_template('index.html')

# Route för att lägga till en ny användare (POST)
@app.route('/api/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Kontrollera om användaren redan finns
    user_exists = User.query.filter_by(email=email).first()
    
    if user_exists:
        return jsonify({"error": "Användare finns redan!"}), 400

    # Skapa och spara ny användare i databasen
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": f"Användare {email} skapad!"}), 201

# Route för att hämta alla användare (GET)
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{"id": user.user_id, "email": user.email} for user in users]
    return jsonify(users_list), 200

if __name__ == '__main__':
    app.run(debug=True)
    #app.run("0.0.0.0", port=5000, debug=True)      #For testing on non-localhost
