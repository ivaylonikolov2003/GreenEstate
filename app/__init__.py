from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Инициализация на библиотеките
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # CORS конфигурация
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Регистрация на routes
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.plants import plants_bp
    from app.routes.garden_plans import garden_plans_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(garden_plans_bp)

    return app