from flask import Blueprint, request, jsonify, current_app, url_for
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from werkzeug.security import generate_password_hash
from models.auth_model import User
from extensions import mail, db

mail_bp = Blueprint('mail', __name__)

# Initialize the serializer with a secret key
serializer = URLSafeTimedSerializer('your-secret-key')  # Replace with your app's secret key

@mail_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()

    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

    email = data['email']
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User with this email does not exist'}), 404

    # Generate token with itsdangerous
    token = serializer.dumps(email, salt='password-reset-salt')
    reset_link = f"http://localhost:3000/reset-password?token={token}&email={email}"

    # Send email
    msg = Message(
        subject='Återställning av lösenord',
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.body = f"""
    Hej {user.first_name},

    Följ länken nedan för att återställa ditt lösenord:
    {reset_link}

    Om du inte efterfrågat en återställning av lösenord kan du ignorera detta.

    Tack,
    Alltid Redo-supporten
    """
    msg.html = f"""
    <p>Hej {user.first_name},</p>
    <p>Följ länken nedan för att återställa ditt lösenord:</p>
    <p><a href="{reset_link}" style="color:blue;">Återställ lösenord</a></p>
    <p>Om du inte efterfrågat en återställning av lösenord kan du ignorera detta.</p>
    <p>Tack,<br>Alltid Redo-supporten</p>
    """

    try:
        mail.send(msg)
        return jsonify({'message': 'Password reset email sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to send email', 'details': str(e)}), 500

@mail_bp.route('/api/auth/reset-password-confirm', methods=['GET'])
def reset_password_confirm():
    token = request.args.get('token')

    if not token:
        return jsonify({'error': 'Token is required'}), 400

    try:
        # Decode token
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # Token expires after 1 hour
        return jsonify({'message': 'Token is valid', 'email': email}), 200
    except SignatureExpired:
        return jsonify({'error': 'Token has expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid token'}), 400
    
    
@mail_bp.route('/api/auth/update-password', methods=['POST'])
def update_password():
    data = request.get_json()

    email = data.get('email')
    token = data.get('token')
    new_password = data.get('password')

    if not email or not token or not new_password:
        return jsonify({'error': 'Alla fält måste fyllas i'}), 400

    try:
        # Validera token
        email_from_token = serializer.loads(token, salt='password-reset-salt', max_age=3600)
        if email != email_from_token:
            return jsonify({'error': 'Invalid token or email'}), 400
    except SignatureExpired:
        return jsonify({'error': 'Token has expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid token'}), 400

    # Uppdatera lösenord
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Användaren existerar inte'}), 404

    user.password = generate_password_hash(new_password)  # Uppdatera lösenordet
    db.session.commit()

    return jsonify({'message': 'Lösenordet har uppdaterats'}), 200
