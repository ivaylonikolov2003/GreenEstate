from app import db
from datetime import datetime

class ConfirmationToken(db.Model):
    __tablename__ = 'confirmation_tokens'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    token = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f'<ConfirmationToken {self.token}>'