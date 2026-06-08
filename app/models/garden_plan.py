from app import db
from datetime import datetime

class GardenPlan(db.Model):
    __tablename__ = 'garden_plans'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    property_id = db.Column(db.BigInteger, db.ForeignKey('properties.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    grid_width = db.Column(db.Integer, nullable=False, default=10)
    grid_height = db.Column(db.Integer, nullable=False, default=10)
    budget = db.Column(db.Numeric(10, 2), default=None)
    canvas_elements = db.Column(db.Text, default=None)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plan_items = db.relationship('PlanItem', backref='garden_plan', lazy=True)

    def __repr__(self):
        return f'<GardenPlan {self.name}>'


class PlanItem(db.Model):
    __tablename__ = 'plan_items'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    plan_id = db.Column(db.BigInteger, db.ForeignKey('garden_plans.id'), nullable=False)
    plant_id = db.Column(db.BigInteger, db.ForeignKey('plants.id'), nullable=False)
    position_x = db.Column(db.Integer, nullable=False)
    position_y = db.Column(db.Integer, nullable=False)
    note = db.Column(db.String(255))

    def __repr__(self):
        return f'<PlanItem {self.id}>'

