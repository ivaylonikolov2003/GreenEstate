from app import db
from datetime import datetime
from app.models.enums import RoleEnum

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(RoleEnum), default=RoleEnum.USER)
    is_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Връзки с други таблици
    properties = db.relationship('Property', backref='user', lazy=True)
    confirmation_token = db.relationship('ConfirmationToken', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'