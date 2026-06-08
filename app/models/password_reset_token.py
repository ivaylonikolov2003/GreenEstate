from app import db
from datetime import datetime

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id         = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    token      = db.Column(db.String(255), nullable=False, unique=True)
    user_id    = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used       = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<PasswordResetToken {self.token}>'