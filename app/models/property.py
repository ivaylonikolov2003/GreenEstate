from app import db
from datetime import datetime
from app.models.enums import PropertyTypeEnum, SunExposureEnum, SoilTypeEnum

class Property(db.Model):
    __tablename__ = 'properties'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.Enum(PropertyTypeEnum), nullable=False)
    area_sqm = db.Column(db.Double, nullable=False)
    green_area_sqm = db.Column(db.Double, nullable=True)  # Площ за озеленяване
    width_m = db.Column(db.Double)
    height_m = db.Column(db.Double)
    sun_exposure = db.Column(db.Enum(SunExposureEnum), nullable=False)
    soil_type = db.Column(db.Enum(SoilTypeEnum))
    region = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Връзки с други таблици
    garden_plans = db.relationship('GardenPlan', backref='property', lazy=True)

    def __repr__(self):
        return f'<Property {self.name}>'