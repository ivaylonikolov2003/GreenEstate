from flask import Blueprint, request, jsonify, redirect
from app import db, mail
from app.models.user import User
from app.models.confirmation_token import ConfirmationToken
from app.models.password_reset_token import PasswordResetToken
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import re
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)


def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Валидация на задължителните полета
    required_fields = ['first_name', 'last_name', 'username', 'email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'message': f'Полето {field} е задължително!'}), 400

    # Валидация на имейл формат
    if not is_valid_email(data['email']):
        return jsonify({'message': 'Невалиден имейл адрес!'}), 400

    # Валидация на парола
    if len(data['password']) < 8:
        return jsonify({'message': 'Паролата трябва да е поне 8 символа!'}), 400

    # Проверка дали потребителят вече съществува
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Потребителското име вече съществува!'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Имейлът вече съществува!'}), 400

    try:
        # Създаване на потребител
        hashed_password = generate_password_hash(data['password'])
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            username=data['username'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(user)
        db.session.commit()

        print(f'User ID: {user.id}')

        # Генериране на токен за потвърждение
        token = secrets.token_hex(32)
        confirmation = ConfirmationToken(
            token=token,
            created_at=datetime.utcnow(),
            user_id=user.id
        )
        db.session.add(confirmation)
        db.session.commit()

        print(f'Token: {token}')

    except Exception as e:
        db.session.rollback()
        print(f'Грешка в базата: {e}')
        return jsonify({'message': f'Грешка при регистрацията: {str(e)}'}), 500

    # Изпращане на имейл - извън try/except за базата
    try:
        confirm_url = f'http://localhost:3000/confirm/{token}'
        msg = Message(
            subject='Потвърди своя акаунт - GreenEstate',
            recipients=[user.email],
            body=f'Здравей {user.first_name},\n\n'
                 f'Моля потвърди акаунта си като кликнеш на линка:\n'
                 f'{confirm_url}\n\n'
                 f'Ако не си се регистрирал в GreenEstate, игнорирай този имейл.\n\n'
                 f'Екипът на GreenEstate'
        )
        mail.send(msg)
    except Exception as e:
        print(f'Грешка при изпращане на имейл: {e}')
        # Не спираме регистрацията ако имейлът не се изпрати

    return jsonify({'message': 'Регистрацията е успешна! Провери имейла си.'}), 201


@auth_bp.route('/confirm/<token>', methods=['GET'])
def confirm_email(token):
    confirmation = ConfirmationToken.query.filter_by(token=token).first()

    if not confirmation:
        return jsonify({'status': 'invalid'}), 200

    user = db.session.get(User, confirmation.user_id)

    if user.is_enabled:
        return jsonify({'status': 'already'}), 200

    user.is_enabled = True
    db.session.delete(confirmation)
    db.session.commit()

    return jsonify({'status': 'success'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Потребителското име и паролата са задължителни!'}), 400

    user = User.query.filter_by(username=data['username']).first()

    if not user:
        return jsonify({'message': 'Невалидно потребителско име или парола!'}), 401

    if not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Невалидно потребителско име или парола!'}), 401

    if not user.is_enabled:
        return jsonify({'message': 'Моля потвърди имейла си преди да влезеш!'}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'user_id': user.id,
        'username': user.username,
        'role': user.role.value
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Излязохте успешно!'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip()

    if not email:
        return jsonify({'message': 'Имейлът е задължителен!'}), 400

    user = User.query.filter_by(email=email).first()

    # Винаги връщаме успех за сигурност (не разкриваме дали имейлът съществува)
    if not user:
        return jsonify({'message': 'Ако имейлът съществува, ще получиш линк за смяна на паролата.'}), 200

    # Изтриваме стари токени за този потребител
    PasswordResetToken.query.filter_by(user_id=user.id, used=False).delete()
    db.session.commit()

    token = secrets.token_hex(32)
    reset_token = PasswordResetToken(token=token, user_id=user.id)
    db.session.add(reset_token)
    db.session.commit()

    try:
        reset_url = f'http://localhost:3000/reset-password?token={token}'
        msg = Message(
            subject='Смяна на парола - GreenEstate',
            recipients=[user.email],
            body=f'Здравей {user.first_name},\n\n'
                 f'Получихме заявка за смяна на паролата ти.\n'
                 f'Кликни на линка за да зададеш нова парола (валиден 1 час):\n'
                 f'{reset_url}\n\n'
                 f'Ако не си поискал смяна на парола, игнорирай този имейл.\n\n'
                 f'Екипът на GreenEstate'
        )
        mail.send(msg)
    except Exception as e:
        print(f'Грешка при изпращане на имейл: {e}')

    return jsonify({'message': 'Ако имейлът съществува, ще получиш линк за смяна на паролата.'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token    = data.get('token', '').strip()
    password = data.get('password', '')

    if not token or not password:
        return jsonify({'message': 'Токенът и паролата са задължителни!'}), 400

    if len(password) < 8:
        return jsonify({'message': 'Паролата трябва да е поне 8 символа!'}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token, used=False).first()

    if not reset_token:
        return jsonify({'message': 'Невалиден или вече използван линк!'}), 400

    # Проверка за изтекъл токен (1 час)
    expires_at = reset_token.created_at + timedelta(hours=1)
    if datetime.utcnow() > expires_at:
        db.session.delete(reset_token)
        db.session.commit()
        return jsonify({'message': 'Линкът е изтекъл! Моля поискай нов.'}), 400

    user = db.session.get(User, reset_token.user_id)
    if not user:
        return jsonify({'message': 'Потребителят не е намерен!'}), 404

    user.password = generate_password_hash(password)
    reset_token.used = True
    db.session.commit()

    return jsonify({'message': 'Паролата е сменена успешно!'}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'message': 'Потребителят не е намерен!'}), 404
    return jsonify({
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'username': user.username,
        'email': user.email,
        'role': user.role.value,
        'created_at': user.created_at.strftime('%d.%m.%Y') if user.created_at else None
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'message': 'Потребителят не е намерен!'}), 404

    data = request.get_json()

    # Смяна на имена
    if data.get('first_name'):
        user.first_name = data['first_name']
    if data.get('last_name'):
        user.last_name = data['last_name']

    # Смяна на имейл
    if data.get('email') and data['email'] != user.email:
        if not is_valid_email(data['email']):
            return jsonify({'message': 'Невалиден имейл адрес!'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Имейлът вече се използва!'}), 400
        user.email = data['email']

    # Смяна на парола
    if data.get('new_password'):
        if not data.get('current_password'):
            return jsonify({'message': 'Въведи текущата парола!'}), 400
        if not check_password_hash(user.password, data['current_password']):
            return jsonify({'message': 'Грешна текуща парола!'}), 400
        if len(data['new_password']) < 8:
            return jsonify({'message': 'Новата парола трябва да е поне 8 символа!'}), 400
        user.password = generate_password_hash(data['new_password'])

    db.session.commit()
    return jsonify({'message': 'Профилът е обновен успешно!'}), 200


@auth_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    from app.models.property import Property
    from app.models.garden_plan import GardenPlan, PlanItem

    properties = Property.query.filter_by(user_id=user_id).all()
    prop_ids = [p.id for p in properties]

    plans = GardenPlan.query.filter(GardenPlan.property_id.in_(prop_ids)).all() if prop_ids else []
    plan_ids = [p.id for p in plans]

    total_budget = sum(float(p.budget) for p in plans if p.budget)

    return jsonify({
        'properties_count': len(properties),
        'plans_count': len(plans),
        'total_area': round(sum(float(p.area_sqm) for p in properties), 1),
        'total_budget': round(total_budget, 2),
    }), 200